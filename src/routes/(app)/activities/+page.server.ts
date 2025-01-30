import { db } from '$lib/server/db';
import { eq, and, desc } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const offsetParam = event.url.searchParams.get('offset');
	let offset = offsetParam ? parseInt(offsetParam) : 0;
	if (typeof offset !== 'number' || offset < 0) {
		offset = 0;
	}

	const results = await db
		.select({
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
		.where(and(eq(table.summit_attempt.published, true)))
		.orderBy(desc(table.summit_attempt.date))
		.limit(50)
		.offset(offset);

	return {
		activities: results,
		offset
	};
};
