import { db } from '$lib/server/db';
import { eq, and, desc, gte, lt, sql } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const clubId = event.locals.activeClub?.id ?? null;
	const now = new Date();
	const yearParam = event.url.searchParams.get('year') ?? String(now.getFullYear());
	const monthParam = event.url.searchParams.get('month') ?? String(now.getMonth() + 1);

	const year = parseInt(yearParam, 10);
	const month = parseInt(monthParam, 10);

	const start = new Date(year, month - 1, 1);
	const end = new Date(year, month, 1);

	const conditions = [
		eq(table.summit_attempt.published, true),
		gte(table.summit_attempt.date, start),
		lt(table.summit_attempt.date, end)
	];

	const results = clubId
		? await db
				.select({
					attemptId: table.summit_attempt.id,
					id: table.summit.id,
					name: table.summit.name,
					date: table.summit_attempt.date,
					firstName: table.user.firstName,
					lastName: table.user.lastName,
					profile: table.user.profile,
					win: table.winActivitiesClubView.activityId
				})
				.from(table.summit_attempt)
				.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
				.innerJoin(table.user, eq(table.summit_attempt.userId, table.user.id))
				.leftJoin(
					table.winActivitiesClubView,
					and(
						eq(table.summit_attempt.summitId, table.winActivitiesClubView.summitId),
						eq(table.summit_attempt.activityId, table.winActivitiesClubView.activityId),
						eq(table.winActivitiesClubView.clubId, clubId)
					)
				)
				.innerJoin(
					table.userClub,
					and(
						eq(table.userClub.userId, table.summit_attempt.userId),
						eq(table.userClub.clubId, clubId)
					)
				)
				.where(and(...conditions))
				.orderBy(desc(table.summit_attempt.date))
		: await db
				.select({
					attemptId: table.summit_attempt.id,
					id: table.summit.id,
					name: table.summit.name,
					date: table.summit_attempt.date,
					firstName: table.user.firstName,
					lastName: table.user.lastName,
					profile: table.user.profile,
					win: table.winActivitiesView.activityId
				})
				.from(table.summit_attempt)
				.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
				.innerJoin(table.user, eq(table.summit_attempt.userId, table.user.id))
				.leftJoin(
					table.winActivitiesView,
					and(
						eq(table.summit_attempt.summitId, table.winActivitiesView.summitId),
						eq(table.summit_attempt.activityId, table.winActivitiesView.activityId)
					)
				)
				.where(and(...conditions))
				.orderBy(desc(table.summit_attempt.date));

	// Find the earliest published attempt to determine how far back the dropdown goes
	const [earliest] = await db
		.select({ minDate: sql<Date>`MIN(${table.summit_attempt.date})` })
		.from(table.summit_attempt)
		.where(eq(table.summit_attempt.published, true));

	const availableMonths: { year: number; month: number }[] = [];
	const startMonth = earliest?.minDate ? new Date(earliest.minDate) : now;
	let cursor = new Date(now.getFullYear(), now.getMonth(), 1);
	const floor = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
	while (cursor >= floor) {
		availableMonths.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
		cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
	}

	return {
		activities: results,
		availableMonths,
		selectedYear: yearParam,
		selectedMonth: monthParam
	};
};
