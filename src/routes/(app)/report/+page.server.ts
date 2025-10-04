import type { Actions, PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';

import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const form = await superValidate(zod4(table.summitAttemptInsertSchema));
	const { user } = await event.parent();

	return { form, user };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(table.summitAttemptInsertSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db.insert(table.summit_attempt).values({
				activityId: form.data.activityId,
				summitId: form.data.summitId,
				userId: form.data.userId,
				date: form.data.date,
				published: true
			});
		} catch (e) {
			console.error(e);
			return message(
				form,
				'Fehler bim Erfasse. Der Pass mues ume si, dini Strava Aktivitaet mues oeffentlech si.',
				{ status: 500 }
			);
		}

		return message(form, 'Erfolgrich erfasst');
	}
} satisfies Actions;
