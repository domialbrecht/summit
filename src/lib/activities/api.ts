import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { getTokensForUser } from '$lib/server/strava_auth';
import { error, redirect } from '@sveltejs/kit';
import { desc, eq, sql } from 'drizzle-orm';
import { updateActivities } from './activity_sync';
import logger from '$lib/logger';

type SportType =
	| 'AlpineSki'
	| 'BackcountrySki'
	| 'Badminton'
	| 'Canoeing'
	| 'Crossfit'
	| 'EBikeRide'
	| 'Elliptical'
	| 'EMountainBikeRide'
	| 'Golf'
	| 'Handcycle'
	| 'HighIntensityIntervalTraining'
	| 'Hike'
	| 'IceSkate'
	| 'InlineSkate'
	| 'Kayaking'
	| 'Kitesurf'
	| 'NordicSki'
	| 'Pickleball'
	| 'Pilates'
	| 'Racquetball'
	| 'RockClimbing'
	| 'RollerSki'
	| 'Rowing'
	| 'Run'
	| 'GravelRide'
	| 'MountainBikeRide'
	| 'Ride'
	| 'Sail'
	| 'Skateboard'
	| 'Snowboard'
	| 'Snowshoe'
	| 'Soccer'
	| 'Squash'
	| 'StairStepper'
	| 'StandUpPaddling'
	| 'Surfing'
	| 'Swim'
	| 'TableTennis'
	| 'Tennis'
	| 'TrailRun'
	| 'Velomobile'
	| 'VirtualRide'
	| 'VirtualRow'
	| 'VirtualRun'
	| 'Walk'
	| 'WeightTraining'
	| 'Wheelchair'
	| 'Windsurf'
	| 'Workout'
	| 'Yoga';

export type StravaActivity = {
	id: number;
	upload_id: number;
	name: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	total_elevation_gain: number;
	type: string;
	trainer: boolean;
	start_date: string;
	average_speed: number;
	max_speed: number;
	average_watts: number;
	sport_type: SportType;
	map: {
		id: string;
		summary_polyline: string;
	};
};

export type DetailActivity = StravaActivity & {
	photos: {
		primary: {
			id: string | null;
			urls: {
				[key: string]: string;
			};
		};
	};
};

export type Stream<T> = {
	data: T[];
};

export type ActivityStreams = {
	latlng: Stream<number[][]>;
	time: Stream<number[]>;
	distance: Stream<number[]>;
};

async function stravaFetch(
	endpoint: string,
	userId: string,
	options?: Record<string, string | string>
) {
	const tokens = await getTokensForUser(userId);
	if (!tokens) {
		logger.error({
			message: 'Failed to fetch data from Strava with error',
			data: 'No tokens found'
		});
		redirect(304, 'logout/direct');
	}

	const url = new URL(`https://www.strava.com/api/v3/${endpoint}`);
	if (options) {
		url.search = new URLSearchParams(options).toString();
	}

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${tokens.accessToken}`
		}
	});

	if (!response.ok) {
		const api_err = await response.json();
		logger.error({ message: 'Failed to fetch data from Strava with error', data: api_err });
		error(response.status, { message: `Failed to fetch data from Strava with error` });
	}

	return await response.json();
}

const dateToUnixTimestamp = (date: Date): string => {
	return Math.floor(date.getTime() / 1000).toString();
};

export async function getActivity(userId: string, activityId: string) {
	const activity: DetailActivity = await stravaFetch(
		`activities/${activityId}?include_all_efforts=false`,
		userId
	);
	return [activity];
}

export async function manualFetch(userId: string) {
	// Sync last two weeks of activities
	const EARLIEST = new Date('2026-01-01');
	const UPDATE_CYCLE_DAYS = 14;
	const today = new Date();
	today.setHours(today.getHours() - 1);
	const results = await db
		.select({ startDate: table.activity.startDate })
		.from(table.activity)
		.where(eq(table.activity.userId, userId))
		.orderBy(desc(table.activity.startDate))
		.limit(1);

	let lastSynced = results.at(0)?.startDate;

	if (!lastSynced) {
		lastSynced = new Date();
		lastSynced.setDate(today.getDate() - UPDATE_CYCLE_DAYS);
	}

	if (lastSynced.getTime() < EARLIEST.getTime()) {
		lastSynced = EARLIEST;
	}

	const options = {
		before: dateToUnixTimestamp(today),
		after: dateToUnixTimestamp(lastSynced)
	};

	logger.info({ message: 'Fetch strava activities', data: { user: userId, options: options } });
	const activities: StravaActivity[] = await stravaFetch('athlete/activities', userId, options);
	if (activities.length === 0) {
		return [];
	}
	logger.info({ message: 'Finished fetching for user', data: { user: userId } });
	return activities;
}

export async function updateActivityCache(
	userId: string,
	activities: StravaActivity[]
): Promise<number> {
	activities = filterActivities(activities);
	if (activities.length === 0) {
		return 0;
	}

	logger.info({
		message: 'Updating db activities',
		data: { user: userId, activities: activities }
	});
	await updateActivities(userId, activities);
	logger.info({ message: 'Finished db activities write', data: { user: userId } });

	return activities.length;
}

export async function syncPhotos(userId: string, activityId: string) {
	const hasPhotos = await db.$count(
		table.activityMedia,
		eq(table.activityMedia.activityId, activityId)
	);

	if (hasPhotos > 0) {
		return;
	}

	const detail: DetailActivity = await stravaFetch(
		`activities/${activityId}?include_all_efforts=false`,
		userId
	);
	if (!detail.photos || !detail.photos.primary || !detail.photos.primary.urls) {
		return;
	}
	const photo = detail.photos.primary.urls['600'];
	if (!photo) {
		return;
	}
	await db
		.insert(table.activityMedia)
		.values({
			url: photo,
			activityId: activityId
		})
		.onConflictDoNothing();
}

export async function updateActivityDetail(userId: string, activityId: string) {
	const stream: ActivityStreams = await stravaFetch(
		`activities/${activityId}/streams?keys=latlng,time&key_by_type=true`,
		userId
	);

	logger.info({ message: 'Got detail stream' });
	const points = stream.latlng.data.map((coord, index) => {
		const [lat, lon] = coord;
		const t = stream.time.data[index];

		return `${lon} ${lat} ${t}`;
	});

	const linestringM = `LINESTRINGM(${points.join(', ')})`;
	const ewkt = `SRID=4326;${linestringM}`;
	const query = db
		.update(table.activity)
		.set({
			linestring: sql`ST_GeomFromEWKT(${ewkt})`
		})
		.where(eq(table.activity.id, activityId))
		.prepare('query');
	await query.execute();
}

//TODO: Adjust this with proper validatoin
function filterActivities(activities: StravaActivity[]): StravaActivity[] {
	const allowedSportTypes = ['GravelRide', 'MountainBikeRide', 'Ride'];
	return activities.filter(
		(a) =>
			allowedSportTypes.includes(a.sport_type) &&
			a.trainer === false &&
			a.map &&
			a.map.summary_polyline &&
			a.elapsed_time
	);
}
