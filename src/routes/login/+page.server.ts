import { error, redirect } from '@sveltejs/kit';

import type { RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	if (event.locals.session !== null && event.locals.user !== null) {
		return redirect(302, '/');
	}

	if (event.url.searchParams.has('noclub')) {
		error(403, { message: 'You must be a member of the SolyVC Strava club to access this site.' });
	}

	return {};
}
