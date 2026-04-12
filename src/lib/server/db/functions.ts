import { db } from '$lib/server/db';
import { eq, and, count, asc, desc, sql } from 'drizzle-orm';
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

export async function getSeasons() {
	return db
		.select({
			id: table.season.id,
			slug: table.season.slug,
			name: table.season.name,
			isActive: table.season.isActive
		})
		.from(table.season)
		.orderBy(desc(table.season.isActive), desc(table.season.startsAt), asc(table.season.slug));
}

export async function getUserSeasonStats(userId: string, seasonId: number) {
	const attempts = await db
		.select({
			date: table.summit_attempt.date,
			attemptId: table.summit_attempt.id,
			summitId: table.summit_attempt.summitId,
			winAttemptId: table.winActivitiesBySeasonView.attemptId
		})
		.from(table.summit_attempt)
		.leftJoin(
			table.winActivitiesBySeasonView,
			and(
				eq(table.winActivitiesBySeasonView.attemptId, table.summit_attempt.id),
				eq(table.winActivitiesBySeasonView.seasonId, table.summit_attempt.seasonId)
			)
		)
		.where(
			and(
				eq(table.summit_attempt.userId, userId),
				eq(table.summit_attempt.seasonId, seasonId),
				eq(table.summit_attempt.published, true)
			)
		)
		.orderBy(asc(table.summit_attempt.date));

	const seenSummits = new Set<number>();
	let cumulativeTrophies = 0;

	return attempts.map((row) => {
		seenSummits.add(row.summitId);
		if (row.winAttemptId !== null) {
			cumulativeTrophies++;
		}
		return {
			date: row.date,
			summitId: row.summitId,
			attempts: seenSummits.size,
			trophies: cumulativeTrophies
		};
	});
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

export type ProgressPoint = {
	month: number; // 0-11
	trophies: number;
	summits: number;
};

export type ProgressComparison = {
	user: ProgressPoint[];
	average: ProgressPoint[];
	second: ProgressPoint[];
};

/**
 * Get monthly cumulative progress for user vs average vs 2nd place in a season.
 * "summits" = distinct summits attempted, "trophies" = wins (first to summit).
 */
export async function getSeasonProgressComparison(
	userId: string,
	seasonId: number
): Promise<ProgressComparison> {
	// Get all published attempts in this season with win info
	const rows = await db
		.select({
			usrId: table.summit_attempt.userId,
			summitId: table.summit_attempt.summitId,
			date: table.summit_attempt.date,
			winAttemptId: table.winActivitiesBySeasonView.attemptId
		})
		.from(table.summit_attempt)
		.leftJoin(
			table.winActivitiesBySeasonView,
			and(
				eq(table.winActivitiesBySeasonView.attemptId, table.summit_attempt.id),
				eq(table.winActivitiesBySeasonView.seasonId, table.summit_attempt.seasonId)
			)
		)
		.where(
			and(eq(table.summit_attempt.seasonId, seasonId), eq(table.summit_attempt.published, true))
		)
		.orderBy(asc(table.summit_attempt.date));

	// Group by user → monthly cumulative trophies & distinct summits
	const userMap = new Map<
		string,
		{ summits: Set<number>; trophies: number; monthly: ProgressPoint[] }
	>();

	for (const row of rows) {
		let entry = userMap.get(row.usrId);
		if (!entry) {
			entry = { summits: new Set(), trophies: 0, monthly: [] };
			userMap.set(row.usrId, entry);
		}
		entry.summits.add(row.summitId);
		if (row.winAttemptId !== null) {
			entry.trophies++;
		}
		const m = new Date(row.date).getMonth();
		// Update or add monthly point (last value per month = cumulative at end of month)
		const existing = entry.monthly.find((p) => p.month === m);
		if (existing) {
			existing.trophies = entry.trophies;
			existing.summits = entry.summits.size;
		} else {
			entry.monthly.push({ month: m, trophies: entry.trophies, summits: entry.summits.size });
		}
	}

	// Current user's progress
	const userProgress = userMap.get(userId)?.monthly ?? [];

	// For average: exclude current user
	const otherUsers = [...userMap.entries()].filter(([id]) => id !== userId).map(([, v]) => v);

	// Average of others
	const avgProgress: ProgressPoint[] = [];
	if (otherUsers.length > 0) {
		for (let m = 0; m <= 11; m++) {
			let totalTrophies = 0;
			let totalSummits = 0;
			let cnt = 0;
			for (const u of otherUsers) {
				// Find the latest entry at or before month m
				let val: ProgressPoint | undefined;
				for (const p of u.monthly) {
					if (p.month <= m) {
						if (!val || p.month > val.month) val = p;
					}
				}
				if (val) {
					totalTrophies += val.trophies;
					totalSummits += val.summits;
					cnt++;
				}
			}
			if (cnt > 0) {
				avgProgress.push({
					month: m,
					trophies: Math.round((totalTrophies / cnt) * 10) / 10,
					summits: Math.round((totalSummits / cnt) * 10) / 10
				});
			}
		}
	}

	// 2nd place: user with most trophies (then summits) excluding first
	const allUsers = [...userMap.values()];
	const ranked = allUsers
		.map((u) => {
			const last = u.monthly[u.monthly.length - 1];
			return { monthly: u.monthly, trophies: last?.trophies ?? 0, summits: last?.summits ?? 0 };
		})
		.sort((a, b) => b.trophies - a.trophies || b.summits - a.summits);

	const secondProgress = ranked.length >= 2 ? ranked[1].monthly : [];

	return {
		user: userProgress,
		average: avgProgress,
		second: secondProgress
	};
}
