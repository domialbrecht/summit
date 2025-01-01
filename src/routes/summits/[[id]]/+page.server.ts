import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { gte, lt, min, and, sql, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { UserSummitWin } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	let summit_wins: UserSummitWin[] = [];
	let summit_data: table.SelectSummit | undefined = undefined;
	if (params.id) {
		const summit_result = await db
			.select()
			.from(table.summit)
			.where(eq(table.summit.id, parseInt(params.id)));
		summit_data = summit_result.at(0);

		const earliestAttempt = db
			.select({ minDate: min(table.summit_attempt.date) })
			.from(table.summit_attempt)
			.where(
				and(
					eq(table.summit_attempt.summitId, parseInt(params.id)),
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
					eq(table.summit_attempt.summitId, parseInt(params.id)),
					eq(table.summit_attempt.published, true),
					gte(table.summit_attempt.date, earliestAttempt),
					lt(table.summit_attempt.date, sql`${earliestAttempt} + interval '1 minute'`)
				)
			);

		summit_wins = win_result;
	}

	if (params.id && !summit_wins) {
		error(404, { message: 'Summit not found' });
	}

	return {
		summit_wins: summit_wins,
		summit_data: summit_data
	};
};
