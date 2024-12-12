import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	if (event.locals.session) {
		invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);
	}
	return redirect(302, '/login');
}
