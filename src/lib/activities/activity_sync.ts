import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, notExists } from 'drizzle-orm';

import type { StravaActivity } from './api.js';
import logger from '$lib/logger.js';

export async function updateActivities(userId: string, activities: StravaActivity[]) {
	//TODO: Use proper validation
	try {
		await db
			.insert(table.activity)
			.values(
				activities.map((activity) => ({
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
				}))
			)
			.onConflictDoNothing();
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
		summits: number[];
	}>
) {
	if (matches.length === 0) {
		return;
	}

	const values = matches.map((a) => {
		return {
			id: a.id,
			match: a.summits.length > 0
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
