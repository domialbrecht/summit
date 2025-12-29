import { db } from '$lib/server/db';
import { eq, and, count } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';

export async function getActiveSeason() {
	const [s] = await db.select().from(table.season).where(eq(table.season.isActive, true)).limit(1);
	return s;
}

export async function getSeasonBySlug(slug: string) {
	const [s] = await db.select().from(table.season).where(eq(table.season.slug, slug)).limit(1);
	return s;
}

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

export async function getAttemptsBySeason(seasonId: number) {
	return db
		.select({
			userId: table.summit_attempt.userId,
			userName: table.user.firstName,
			profile: table.user.profile,
			attempts: count(table.summit_attempt.id).as('attempts')
		})
		.from(table.summit_attempt)
		.innerJoin(table.user, eq(table.user.id, table.summit_attempt.userId))
		.where(
			and(eq(table.summit_attempt.published, true), eq(table.summit_attempt.seasonId, seasonId))
		)
		.groupBy(table.summit_attempt.userId, table.user.firstName, table.user.profile);
}

export async function db_win_results_by_season(seasonId: number) {
	const win_results = await db
		.select({
			userName: table.user.firstName,
			winAttempt: table.summit_attempt,
			summitName: table.summit.name,
			seasonId: table.winActivitiesBySeasonView.seasonId
		})
		.from(table.winActivitiesBySeasonView)
		.leftJoin(
			table.summit_attempt,
			eq(table.summit_attempt.id, table.winActivitiesBySeasonView.attemptId) // best join
		)
		.leftJoin(table.user, eq(table.user.id, table.winActivitiesBySeasonView.userId))
		.leftJoin(table.summit, eq(table.summit.id, table.winActivitiesBySeasonView.summitId))
		.where(eq(table.winActivitiesBySeasonView.seasonId, seasonId));

	return win_results;
}
