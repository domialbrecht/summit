import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, isNotNull, notExists, sql } from 'drizzle-orm';
import { StravaApi } from '$lib/activities';

import type { StravaActivity } from './api';
import logger from '$lib/logger';
import { syncWithCount } from './attempt';

export async function updateActivities(userId: string, activities: StravaActivity[]) {
	const insertValues = activities.map((activity) => ({
		id: activity.id.toString(),
		userId: userId,
		uploadId: activity.upload_id.toString(),
		name: activity.name,
		distance: activity.distance ? Math.round(activity.distance) : 0,
		movingTime: activity.moving_time.toString(),
		elapsedTime: activity.elapsed_time.toString(),
		totalElevationGain: activity.total_elevation_gain.toString(),
		type: activity.type,
		startDate: new Date(activity.start_date),
		averageSpeed: activity.average_speed ? activity.average_speed.toString() : undefined,
		maxSpeed: activity.max_speed.toString(),
		averageWatts: activity.average_watts ? activity.average_watts.toString() : undefined,
		summaryPolyline: activity.map.summary_polyline
	}));
	try {
		await db
			.insert(table.activity)
			.values(insertValues)
			.onConflictDoUpdate({
				target: table.activity.id,
				set: {
					name: sql.raw(`excluded.${table.activity.name.name}`),
					distance: sql.raw(`excluded.${table.activity.distance.name}`),
					movingTime: sql.raw(`excluded.${table.activity.movingTime.name}`),
					elapsedTime: sql.raw(`excluded.${table.activity.elapsedTime.name}`),
					totalElevationGain: sql.raw(`excluded.${table.activity.totalElevationGain.name}`),
					type: sql.raw(`excluded.${table.activity.type.name}`),
					startDate: sql.raw(`excluded.${table.activity.startDate.name}`),
					averageSpeed: sql.raw(`excluded.${table.activity.averageSpeed.name}`),
					maxSpeed: sql.raw(`excluded.${table.activity.maxSpeed.name}`),
					averageWatts: sql.raw(`excluded.${table.activity.averageWatts.name}`),
					summaryPolyline: sql.raw(`excluded.${table.activity.summaryPolyline.name}`)
				}
			});
	} catch (e) {
		logger.error(`Failed to update activities: ${e}`);
		throw new Error(`Failed to update activities: ${e}`);
	}
}

export async function getUnparsedActivities(userId: string) {
	return await db
		.select({
			id: table.activity.id,
			sum_line: table.activity.summaryPolyline,
			date: table.activity.startDate
		})
		.from(table.activity)
		.where(
			and(
				eq(table.activity.userId, userId),
				notExists(
					db
						.select()
						.from(table.parseActivityResults)
						.where(eq(table.parseActivityResults.activityId, table.activity.id))
				)
			)
		);
}

export async function setParsedActivities(
	matches: Array<{
		id: string;
		date: Date;
		detail_summits: {
			id: number;
			name: string;
			matchtime: number;
		}[];
		summits: number[];
	}>
) {
	if (matches.length === 0) {
		return;
	}

	const values = matches.map((a) => {
		return {
			id: a.id,
			match: a.detail_summits.length > 0
		};
	});

	await db.insert(table.parseActivityResults).values(
		values.map((v) => {
			return {
				activityId: v.id,
				hasMatch: v.match
			};
		})
	);
}

export async function syncHookCallback(
	activityId: number,
	athleteId: number,
	isUpdate: boolean
): Promise<void> {
	const userId = athleteId.toString();

	let skipDetailFetch = false;
	if (isUpdate) {
		const hasDetail = await db.$count(
			table.activity,
			and(eq(table.activity.id, activityId.toString()), isNotNull(table.activity.linestring))
		);

		skipDetailFetch = hasDetail > 0;
	}

	let activities: StravaActivity[] = [];
	try {
		logger.info(`Fetching activity ${activityId} for user ${userId} from hook`);
		activities = await StravaApi.getActivity(userId, activityId.toString());
		logger.info({ message: 'Fetched activity', data: { activity: activities } });
	} catch (e) {
		logger.error(`Failed to fetch activity from hook: ${e} ${activityId}`);
	}

	await StravaApi.updateActivityCache(userId, activities);
	await syncWithCount(userId, skipDetailFetch, true);

	logger.info(`Synced activity ${activityId} for user ${userId} from hook`);
}
