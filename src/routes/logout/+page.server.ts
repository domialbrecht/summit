import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, RequestEvent } from './$types';

export const actions: Actions = {
	default: logout
};

export async function load(event) {
	if (event.locals.session === null) {
		return redirect(302, '/welcome');
	}
}

async function logout(event: RequestEvent) {
	if (event.locals.session === null) {
		return fail(401);
	}
	invalidateSession(event.locals.session.id);
	deleteSessionTokenCookie(event);
	return redirect(302, '/welcome');
}
