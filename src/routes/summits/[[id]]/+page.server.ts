import type { PageServerLoad } from './$types.js';
import * as table from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	let summit_data = undefined;
	if (params.id) {
		const result = await db
			.select({
				summit: {
					id: table.summit.id,
					name: table.summit.name
				},
				winAttempt: table.summit_attempt,
				username: table.user.firstName
			})
			.from(table.summit)
			.leftJoin(table.summit_attempt, eq(table.summit_attempt.id, table.summit.id))
			.leftJoin(table.user, eq(table.user.id, table.summit_attempt.userId))
			.where(eq(table.summit.id, parseInt(params.id)))
			.orderBy(asc(table.summit_attempt.date))
			.limit(1);

		summit_data = result.at(0);
	}

	if (params.id && !summit_data) {
		error(404, { message: 'Summit not found' });
	}

	return {
		summit_data: summit_data
	};
};
