import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';

export const GET: RequestHandler = (event) => {
	if (event.locals.session === null) {
		return redirect(302, '/login');
	}
	invalidateSession(event.locals.session.id);
	deleteSessionTokenCookie(event);
	return redirect(302, '/login');
};
