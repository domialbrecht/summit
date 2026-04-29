import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { registerClub } from '$lib/server/clubs';
import { z } from 'zod/v4';
import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';

const registerClubSchema = z.object({
	strava_club_id: z.number().int().positive()
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(registerClubSchema));
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const user = event.locals.user;
		if (!user) {
			return fail(401);
		}

		const form = await superValidate(event.request, zod4(registerClubSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		let club;
		try {
			club = await registerClub(user.id, form.data.strava_club_id);
		} catch (e) {
			return message(form, e instanceof Error ? e.message : 'Registration failed.', {
				status: 400
			});
		}

		redirect(303, `/clubs/${club.slug}`);
	}
};
