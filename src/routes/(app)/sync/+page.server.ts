import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();

	const results = await db
		.select()
		.from(table.summit_attempt)
		.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
		.innerJoin(table.activity, eq(table.summit_attempt.activityId, table.activity.id))
		.where(
			and(eq(table.summit_attempt.userId, user.id), eq(table.summit_attempt.published, false))
		);

	return {
		attempts: results
	};
};

export const actions = {
	default: async (event) => {
		const user = event.locals.user;
		if (!user) {
			redirect(303, '/login');
		}

		await db
			.update(table.summit_attempt)
			.set({ published: true })
			.where(
				and(eq(table.summit_attempt.userId, user.id), eq(table.summit_attempt.published, false))
			);

		redirect(303, '/');
	}
} satisfies Actions;
