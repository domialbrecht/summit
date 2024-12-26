import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import schema from './schema';

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
		attempts: results,
		uploadForm: await superValidate(zod(schema))
	};
};

export const actions = {
	publish: async (event) => {
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
	},
	upload: async ({ request }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO: Do something with the image
		console.log(form.data.images);

		return message(form, 'You have uploaded a valid file!');
	}
} satisfies Actions;
