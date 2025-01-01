import { db } from '$lib/server/db';
import { eq, and, min, count, lt, gte, sql } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';

async function getLeaderboard() {
	const earliestAttempts = db
		.select({
			summitId: table.summit_attempt.summitId,
			minDate: min(table.summit_attempt.date).as('minDate')
		})
		.from(table.summit_attempt)
		.where(eq(table.summit_attempt.published, true))
		.groupBy(table.summit_attempt.summitId)
		.as('earliestAttempts');

	const win_results = await db
		.selectDistinctOn([table.user.id, table.summit_attempt.summitId], {
			userName: table.user.firstName,
			winAttempt: table.summit_attempt,
			summitName: table.summit.name
		})
		.from(table.summit_attempt)
		.leftJoin(table.user, eq(table.user.id, table.summit_attempt.userId))
		.innerJoin(earliestAttempts, eq(table.summit_attempt.summitId, earliestAttempts.summitId))
		.leftJoin(table.summit, eq(table.summit.id, table.summit_attempt.summitId))
		.where(
			and(
				eq(table.summit_attempt.published, true),
				gte(table.summit_attempt.date, earliestAttempts.minDate),
				lt(table.summit_attempt.date, sql`${earliestAttempts.minDate} + interval '1 minute'`)
			)
		);

	const attempts = await db
		.select({
			userId: table.summit_attempt.userId,
			userName: table.user.firstName,
			profile: table.user.profile,
			attempts: count(table.summit_attempt.id).as('attempts')
		})
		.from(table.summit_attempt)
		.innerJoin(table.user, eq(table.user.id, table.summit_attempt.userId))
		.where(eq(table.summit_attempt.published, true))
		.groupBy(table.summit_attempt.userId, table.user.firstName, table.user.profile);

	return {
		attempts: attempts,
		wins: win_results
	};
}

export async function load() {
	const data = await getLeaderboard();
	return { leaderboard: data };
}
