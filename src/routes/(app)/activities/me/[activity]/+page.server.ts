import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();
	const activityId = event.params.activity;

	const result = await db
		.select()
		.from(table.summit_attempt)
		.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
		.innerJoin(table.activity, eq(table.summit_attempt.activityId, table.activity.id))
		.where(
			and(eq(table.summit_attempt.activityId, activityId), eq(table.summit_attempt.userId, user.id))
		);

	return {
		summits: result
	};
};
