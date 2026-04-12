import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { count, eq, and, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { user } = await parent();
	let user_data;
	let statuser;
	if (params.id) {
		const userId = params.id;
		statuser = await db
			.select({ name: table.user.firstName })
			.from(table.user)
			.where(eq(table.user.id, userId));

		user_data = await db
			.select({
				winAttempt: count(table.winActivitiesView.summitId).as('winAttempt'),
				summitName: table.summit.name,
				summitId: table.summit_attempt.summitId,
				areas: sql<{ id: number; name: string }[]>`
					COALESCE(
						json_agg(DISTINCT jsonb_build_object('id', ${table.area.id}, 'name', ${table.area.name}))
						FILTER (WHERE ${table.area.id} IS NOT NULL),
						'[]'
					)
				`.as('areas')
			})
			.from(table.summit_attempt)
			.leftJoin(table.summit, eq(table.summit.id, table.summit_attempt.summitId))
			.leftJoin(
				table.winActivitiesView,
				and(
					eq(table.summit_attempt.activityId, table.winActivitiesView.activityId),
					eq(table.summit_attempt.summitId, table.winActivitiesView.summitId)
				)
			)
			.leftJoin(
				table.summitsToAreas,
				eq(table.summitsToAreas.summitId, table.summit_attempt.summitId)
			)
			.leftJoin(table.area, eq(table.area.id, table.summitsToAreas.areaId))
			.groupBy(table.summit_attempt.summitId, table.summit.name)
			.where(
				and(eq(table.summit_attempt.userId, userId), eq(table.summit_attempt.published, true))
			);
	}

	if ((params.id && !user_data) || !statuser) {
		error(404, { message: 'User not found' });
	}

	// Group summits by area for display
	type SummitEntry = NonNullable<typeof user_data>[number];
	const areaMap = new Map<string, SummitEntry[]>();
	if (user_data) {
		for (const entry of user_data) {
			const areas =
				Array.isArray(entry.areas) && entry.areas.length > 0
					? entry.areas
					: [{ id: 0, name: 'Andere' }];
			for (const area of areas) {
				const key = area.name;
				if (!areaMap.has(key)) {
					areaMap.set(key, []);
				}
				areaMap.get(key)!.push(entry);
			}
		}
	}

	// Sort: named areas first alphabetically, "Andere" last
	const groupedSummits = [...areaMap.entries()]
		.sort(([a], [b]) => {
			if (a === 'Andere') return 1;
			if (b === 'Andere') return -1;
			return a.localeCompare(b);
		})
		.map(([area, summits]) => ({ area, summits }));

	return {
		loggedin: user,
		user: statuser.at(0),
		userSummits: user_data,
		groupedSummits
	};
};
