import { db } from '$lib/server/db';
import { eq, desc, countDistinct, and } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { user } = await parent();
	if (!user) {
		redirect(302, '/welcome');
	}

	if (!params.id) {
		redirect(302, '/achievements');
	}

	const areaSummits = db
		.select({
			summit: table.summit,
			done: countDistinct(table.summit_attempt.summitId).as('done')
		})
		.from(table.summitsToAreas)
		.innerJoin(table.summit, eq(table.summitsToAreas.summitId, table.summit.id))
		.leftJoin(
			table.summit_attempt,
			and(
				eq(table.summit_attempt.summitId, table.summitsToAreas.summitId),
				eq(table.summit_attempt.userId, user.id)
			)
		)
		.groupBy(table.summit.id)
		.orderBy(({ done }) => desc(done))
		.where(eq(table.summitsToAreas.areaId, parseInt(params.id)));

	const area = await db
		.select({ name: table.area.name })
		.from(table.area)
		.where(eq(table.area.id, parseInt(params.id)));

	const areaName = area.at(0)?.name;
	if (!areaName) {
		redirect(302, '/achievements');
	}

	return { summits: areaSummits, area: areaName };
};
