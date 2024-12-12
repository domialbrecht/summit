import { fail, redirect } from '@sveltejs/kit';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';

import type { Actions, RequestEvent } from './$types';
import { StravaApi } from '$lib/strava';

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	return {
		user: event.locals.user
	};
}

export const actions: Actions = {
	logout: logout,
	sync: sync
};

async function logout(event: RequestEvent) {
	if (event.locals.session === null) {
		return fail(401);
	}
	invalidateSession(event.locals.session.id);
	deleteSessionTokenCookie(event);
	return redirect(302, '/login');
}

async function sync(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	StravaApi.updateActivityCache(event.locals.user.id);
	return { success: true };
}
