import { db } from '$lib/server/db';
import { eq, count, and, desc, isNotNull } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

async function getAreas(userId: string) {
	//Select all summits grouped by areas. Join winAttempt as hasWin
	return await db
		.select({
			area: table.area,
			total: count(table.summitsToAreas.summitId).as('total'),
			hasWin: count(table.winActivitiesView.summitId).as('win')
		})
		.from(table.summitsToAreas)
		.innerJoin(table.area, eq(table.summitsToAreas.areaId, table.area.id))
		.leftJoin(
			table.winActivitiesView,
			and(
				eq(table.summitsToAreas.summitId, table.winActivitiesView.summitId),
				eq(table.winActivitiesView.userId, userId)
			)
		)
		.where(isNotNull(table.summitsToAreas.areaId))
		.groupBy(table.area.id)
		.orderBy(desc(count(table.winActivitiesView.summitId)));
}

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();
	if (!user) {
		redirect(302, '/welcome');
	}
	return { areas: getAreas(user.id) };
};
