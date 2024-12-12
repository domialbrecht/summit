import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { getTokensForUser } from '$lib/server/oauth';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { updateActivities } from './activity_sync';

export type StravaActivity = {
	id: number;
	upload_id: number;
	name: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	total_elevation_gain: number;
	type: string;
	start_date: string;
	average_speed: number;
	max_speed: number;
	average_watts: number;
};

async function stravaFetch(
	endpoint: string,
	userId: string,
	options?: Record<string, string | string>
) {
	const tokens = await getTokensForUser(userId);
	if (!tokens) {
		error(401, { message: 'No tokens found for user' });
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
		console.error(api_err);
		error(response.status, { message: `Failed to fetch data from Strava with error` });
	}

	return await response.json();
}

const dateToUnixTimestamp = (date: Date): string => {
	return Math.floor(date.getTime() / 1000).toString();
};

export async function updateActivityCache(userId: string) {
	// Sync last two weeks of activities
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

	const options = {
		before: dateToUnixTimestamp(today),
		after: dateToUnixTimestamp(lastSynced)
	};

	const activities = await stravaFetch('athlete/activities', userId, options);
	if (activities.length === 0) {
		return true;
	}

	await updateActivities(userId, activities);

	return true;
}
