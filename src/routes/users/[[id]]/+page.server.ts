import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { count, eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	let user_data;
	if (params.id) {
		const userId = params.id;
		user_data = await db
			.select({
				winAttempt: count(table.winActivitiesView.summitId).as('winAttempt'),
				summitName: table.summit.name,
				summitId: table.summit_attempt.summitId
			})
			.from(table.summit_attempt)
			.leftJoin(table.summit, eq(table.summit.id, table.summit_attempt.summitId))
			.leftJoin(
				table.winActivitiesView,
				and(
					eq(table.summit_attempt.activityId, table.winActivitiesView.activityId),
					eq(table.summit_attempt.summitId, table.winActivitiesView.summitId)
				)
			)
			.groupBy(table.summit_attempt.summitId, table.summit.name)
			.where(eq(table.summit_attempt.userId, userId));
	}

	if (params.id && !user_data) {
		error(404, { message: 'User not found' });
	}

	return {
		userSummits: user_data
	};
};
