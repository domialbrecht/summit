import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/welcome');
	}

	const user = event.locals.user;

	const result = await db
		.select({
			id: table.summit_attempt.id,
			summitId: table.summit.id,
			summitName: table.summit.name,
			lat: table.summit.lat,
			long: table.summit.long
		})
		.from(table.summit_attempt)
		.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
		.where(eq(table.summit_attempt.userId, user.id));

	return {
		activities: result
	};
};
