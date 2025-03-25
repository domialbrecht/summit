import { db } from '$lib/server/db';
import { eq, gt, countDistinct, and } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

async function getAreas(userId: string) {
	return db
		.select({
			area: table.area,
			done: countDistinct(table.summit_attempt.summitId).as('done'),
			total: countDistinct(table.summitsToAreas.summitId).as('total')
		})
		.from(table.summitsToAreas)
		.innerJoin(table.area, eq(table.area.id, table.summitsToAreas.areaId))
		.leftJoin(
			table.summit_attempt,
			and(
				eq(table.summit_attempt.summitId, table.summitsToAreas.summitId),
				eq(table.summit_attempt.userId, userId)
			)
		)
		.groupBy(table.area.id)
		.having(gt(countDistinct(table.summit_attempt.id), 0));
}

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();
	if (!user) {
		redirect(302, '/welcome');
	}
	return { areas: getAreas(user.id) };
};
