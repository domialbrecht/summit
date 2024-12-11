import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { getTokensForUser } from '$lib/server/oauth';
import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

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
		error(response.status, { message: 'Failed to fetch data from Strava' });
	}

	return response.json();
}

export async function updateActivityCache(userId: string) {
	// Sync last two weeks of activities
	const UPDATE_CYCLE_DAYS = 14;
	const today = new Date();
	const results = await db
		.select({ startDate: table.activity.startDate })
		.from(table.activity)
		.where(eq(table.activity.userId, userId))
		.orderBy(desc(table.activity.startDate))
		.limit(1);

	let lastSynced = results.at(0)?.startDate;

	if (!lastSynced) {
		lastSynced = new Date(today.setDate(today.getDate() - UPDATE_CYCLE_DAYS));
	}

	const options = {
		before: today.toISOString(),
		after: lastSynced.toISOString()
	};

	const activities = await stravaFetch('athlete/activities', userId, options);
	await db
		.insert(table.activity)
		.values(
			activities.map((activity: table.Activity) => ({
				id: activity.id,
				userId: userId,
				uploadId: activity.uploadId,
				name: activity.name,
				distance: activity.distance,
				movingTime: activity.movingTime,
				elapsedTime: activity.elapsedTime,
				totalElevationGain: activity.totalElevationGain,
				type: activity.type,
				startDate: activity.startDate,
				averageSpeed: activity.averageSpeed,
				maxSpeed: activity.maxSpeed,
				averageWatts: activity.averageSpeed
			}))
		)
		.onConflictDoNothing();

	return true;
}
