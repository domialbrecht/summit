import { getUsers } from '$lib/strava/db';
import type { RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	return {
		users: getUsers(),
		user: event.locals.user
	};
}
