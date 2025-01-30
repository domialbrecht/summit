import { db } from '$lib/server/db';
import { eq, count } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { db_win_results } from '$lib/server/db/functions';

async function getLeaderboard() {
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

	const wins = await db_win_results();

	return {
		attempts: attempts,
		wins: wins
	};
}

export async function load() {
	const data = await getLeaderboard();
	return { leaderboard: data };
}
