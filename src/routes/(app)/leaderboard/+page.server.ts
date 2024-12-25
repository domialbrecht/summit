import { db } from '$lib/server/db';
import { eq, and, desc, min, count } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { LeaderboardData } from '$lib/types';

async function getLeaderboard(): Promise<LeaderboardData[]> {
	const firstAttempts = db
		.select({
			summitId: table.summit_attempt.summitId,
			firstAttempt: min(table.summit_attempt.date).as('first_attempt')
		})
		.from(table.summit_attempt)
		.groupBy(table.summit_attempt.summitId)
		.as('first_attempts');

	const lastWin = db
		.select({
			userId: table.summit_attempt.userId,
			summitName: table.summit.name,
			summitId: table.summit.id,
			lastWinDate: table.summit_attempt.date
		})
		.from(table.summit_attempt)
		.innerJoin(
			firstAttempts,
			and(
				eq(table.summit_attempt.summitId, firstAttempts.summitId),
				eq(table.summit_attempt.date, firstAttempts.firstAttempt)
			)
		)
		.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
		.orderBy(desc(table.summit_attempt.date))
		.limit(1)
		.as('last_win');

	const leaderboard = await db
		.select({
			userId: table.summit_attempt.userId,
			userName: table.user.firstName,
			userProfile: table.user.profile,
			lastSummitWon: lastWin.summitName,
			lastSummitId: lastWin.summitId,
			wins: count()
		})
		.from(table.summit_attempt)
		.innerJoin(
			firstAttempts,
			and(
				eq(table.summit_attempt.summitId, firstAttempts.summitId),
				eq(table.summit_attempt.date, firstAttempts.firstAttempt)
			)
		)
		.innerJoin(table.user, eq(table.summit_attempt.userId, table.user.id))
		.leftJoin(lastWin, eq(table.summit_attempt.userId, lastWin.userId))
		.groupBy(
			table.summit_attempt.userId,
			table.user.firstName,
			table.user.profile,
			lastWin.summitName,
			lastWin.summitId
		)
		.orderBy(desc(count()));
	return leaderboard;
}

export async function load() {
	const data = await getLeaderboard();
	return { leaderboard: data };
}
