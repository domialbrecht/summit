import { db } from '$lib/server/db';
import { eq, and, desc, gte, lt, sql } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();

	const now = new Date();
	const yearParam = event.url.searchParams.get('year') ?? String(now.getFullYear());
	const monthParam = event.url.searchParams.get('month') ?? String(now.getMonth() + 1);

	const year = parseInt(yearParam, 10);
	const month = parseInt(monthParam, 10);

	const start = new Date(year, month - 1, 1);
	const end = new Date(year, month, 1);

	const conditions = [
		eq(table.activity.userId, user.id),
		gte(table.activity.startDate, start),
		lt(table.activity.startDate, end)
	];

	const result = await db
		.select({
			id: table.activity.id,
			name: table.activity.name,
			distance: table.activity.distance,
			start: table.activity.startDate,
			match: table.parseActivityResults.hasMatch
		})
		.from(table.activity)
		.leftJoin(
			table.parseActivityResults,
			eq(table.parseActivityResults.activityId, table.activity.id)
		)
		.where(and(...conditions))
		.orderBy(desc(table.activity.startDate));

	// Find the earliest activity to determine how far back the dropdown goes
	const [earliest] = await db
		.select({ minDate: sql<Date>`MIN(${table.activity.startDate})` })
		.from(table.activity)
		.where(eq(table.activity.userId, user.id));

	const availableMonths: { year: number; month: number }[] = [];
	const startMonth = earliest?.minDate ? new Date(earliest.minDate) : now;
	let cursor = new Date(now.getFullYear(), now.getMonth(), 1);
	const floor = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
	while (cursor >= floor) {
		availableMonths.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
		cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
	}

	return {
		activities: result,
		availableMonths,
		selectedYear: yearParam,
		selectedMonth: monthParam
	};
};
