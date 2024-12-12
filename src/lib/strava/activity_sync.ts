import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

import type { StravaActivity } from './api';

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
				averageWatts: activity.average_watts.toString()
			}))
		)
		.onConflictDoNothing();
}
