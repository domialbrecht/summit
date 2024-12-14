import { redirect } from '@sveltejs/kit';

import type { Actions, RequestEvent } from './$types';
import { StravaApi } from '$lib/strava';

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (!event.locals.user.isAdmin) {
		return redirect(302, '/me');
	}

	return {
		user: event.locals.user
	};
}

export const actions: Actions = {
	sync: sync
};

async function sync(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	StravaApi.updateActivityCache(event.locals.user.id);
	return { success: true };
}
