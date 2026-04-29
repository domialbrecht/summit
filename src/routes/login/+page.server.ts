import { error, redirect } from '@sveltejs/kit';

import type { RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	if (event.locals.session !== null && event.locals.user !== null) {
		return redirect(302, '/');
	}

	if (event.url.searchParams.has('noclub')) {
		error(403, {
			message:
				'You are not a member of any registered club. Ask a club admin to register your Strava club, or visit /clubs/new if you are a club admin.'
		});
	}

	return {};
}
