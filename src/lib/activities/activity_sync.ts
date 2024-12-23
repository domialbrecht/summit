import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

import type { StravaActivity } from './api.js';

export async function updateActivities(userId: string, activities: StravaActivity[]) {
	await db
		.insert(table.activity)
		.values(
			activities.map((activity) => ({
				id: activity.id.toString(),
				userId: userId,
				uploadId: activity.upload_id.toString(),
				name: activity.name,
				distance: activity.distance.toString(),
				movingTime: activity.moving_time.toString(),
				elapsedTime: activity.elapsed_time.toString(),
				totalElevationGain: activity.total_elevation_gain.toString(),
				type: activity.type,
				startDate: new Date(activity.start_date),
				averageSpeed: activity.average_speed.toString(),
				maxSpeed: activity.max_speed.toString(),
				averageWatts: activity.average_watts.toString(),
				summaryPolyline: activity.map.summary_polyline
			}))
		)
		.onConflictDoNothing();
}

export async function getUnparsedActivities(userId: string) {
	return await db
		.select({
			id: table.activity.id,
			sum_line: table.activity.summaryPolyline,
			date: table.activity.startDate
		})
		.from(table.activity)
		.leftJoin(
			table.parseActivityResults,
			eq(table.activity.id, table.parseActivityResults.activityId)
		)
		.where(and(isNull(table.parseActivityResults.id), eq(table.activity.userId, userId)));
}
