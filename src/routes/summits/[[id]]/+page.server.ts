import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { gte, lt, min, and, sql, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { UserSummitWin } from '$lib/types';

async function getSummitWins(summitId: string | undefined): Promise<UserSummitWin[]> {
	if (!summitId) {
		return [];
	}

	const earliestAttempt = db
		.select({ minDate: min(table.summit_attempt.date) })
		.from(table.summit_attempt)
		.where(
			and(
				eq(table.summit_attempt.summitId, parseInt(summitId)),
				eq(table.summit_attempt.published, true)
			)
		)
		.limit(1);
	const win_result = await db
		.selectDistinctOn([table.user.id], {
			winAttempt: table.summit_attempt,
			username: table.user.firstName,
			profile: table.user.profile
		})
		.from(table.summit_attempt)
		.leftJoin(table.user, eq(table.user.id, table.summit_attempt.userId))
		.where(
			and(
				eq(table.summit_attempt.summitId, parseInt(summitId)),
				eq(table.summit_attempt.published, true),
				gte(table.summit_attempt.date, earliestAttempt),
				lt(table.summit_attempt.date, sql`${earliestAttempt} + interval '1 minute'`)
			)
		);

	return win_result;
}

async function getSummitProfiles(
	summitId: string | undefined
): Promise<Pick<table.SelectSummitProfile, 'name' | 'segment'>[]> {
	if (!summitId) {
		return [];
	}
	return await db
		.select({
			name: table.summit_profile.name,
			segment: table.summit_profile.segment
		})
		.from(table.summit_profile)
		.where(eq(table.summit_profile.summitId, parseInt(summitId)));
}

export const load: PageServerLoad = async ({ params }) => {
	let summit_data:
		| {
				summit: table.SelectSummit;
				areas: table.SelectArea[];
		  }
		| undefined = undefined;
	if (params.id) {
		const result = await db
			.select({
				summit: table.summit,
				areas: sql<
					table.SelectArea[]
				>`json_agg(json_build_object('id', area.id, 'name', area.name))`.as('areas')
			})
			.from(table.summit)
			.leftJoin(table.summitsToAreas, eq(table.summitsToAreas.summitId, table.summit.id))
			.leftJoin(table.area, eq(table.summitsToAreas.areaId, table.area.id))
			.where(eq(table.summit.id, parseInt(params.id)))
			.groupBy(table.summit.id);
		summit_data = result.at(0);
	}

	if (params.id && !summit_data) {
		error(404, { message: 'Summit not found' });
	}

	return {
		summit_wins: getSummitWins(params.id),
		summit_profiles: getSummitProfiles(params.id),
		summit_data: summit_data
	};
};
