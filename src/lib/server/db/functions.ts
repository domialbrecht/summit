import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';

export async function db_win_results() {
	const win_results = await db
		.select({
			userName: table.user.firstName,
			winAttempt: table.summit_attempt,
			summitName: table.summit.name
		})
		.from(table.winActivitiesView)
		.leftJoin(
			table.summit_attempt,
			and(
				eq(table.summit_attempt.activityId, table.winActivitiesView.activityId),
				eq(table.summit_attempt.summitId, table.winActivitiesView.summitId)
			)
		)
		.leftJoin(table.user, eq(table.user.id, table.winActivitiesView.userId))
		.leftJoin(table.summit, eq(table.summit.id, table.winActivitiesView.summitId));
	return win_results;
}
