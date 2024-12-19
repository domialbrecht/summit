import { getUsers } from '$lib/strava/db';
import type { PageServerLoad } from './$types';
import type { RequestEvent } from './$types';

export const load: PageServerLoad = (event: RequestEvent) => {
	return {
		users: getUsers(),
		user: event.locals.user
	};
};
