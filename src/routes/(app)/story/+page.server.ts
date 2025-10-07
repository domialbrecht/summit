import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/welcome');
	}

	const user = event.locals.user;

	const result = await db
		.select({
			activityId: table.activity.id,
			activityName: table.activity.name,
			activityDistance: table.activity.distance,
			activityMovingTime: table.activity.movingTime,
			date: table.activity.startDate,
			attempts: sql<
				{
					id: number;
					summitId: number;
					summitName: string;
					lat: string;
					long: string;
				}[]
			>`json_agg(
      json_build_object(
        'id', ${table.summit_attempt.id},
        'summitId', ${table.summit.id},
        'summitName', ${table.summit.name},
        'lat', ${table.summit.lat},
        'long', ${table.summit.long}
      )
      ORDER BY ${table.summit_attempt.id}
    )`
		})
		.from(table.activity)
		.innerJoin(table.summit_attempt, eq(table.activity.id, table.summit_attempt.activityId))
		.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
		.where(and(eq(table.activity.userId, user.id), eq(table.summit_attempt.published, true)))
		.groupBy(table.activity.id, table.activity.name, table.activity.startDate);
	return {
		activities: result,
		user: user
	};
};
