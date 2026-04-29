import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { setActiveClub } from '$lib/server/clubs';

export const actions: Actions = {
	default: async (event) => {
		const user = event.locals.user;
		const session = event.locals.session;
		if (!user || !session) {
			return fail(401, { error: 'Not authenticated' });
		}

		const formData = await event.request.formData();
		const clubIdStr = formData.get('club_id');

		// null means Global mode
		const clubId = clubIdStr && clubIdStr !== '' ? parseInt(clubIdStr as string, 10) : null;

		if (clubId !== null && (isNaN(clubId) || clubId <= 0)) {
			return fail(400, { error: 'Invalid club ID.' });
		}

		try {
			await setActiveClub(session.id, clubId, user.id);
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Failed to switch club.';
			return fail(400, { error: message });
		}

		const referer = event.request.headers.get('referer');
		const redirectTo = referer ? new URL(referer).pathname : '/';
		redirect(303, redirectTo);
	}
};
