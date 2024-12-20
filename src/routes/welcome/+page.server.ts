import { getUsers } from '$lib/server/db/user';
import type { PageServerLoad, RequestEvent } from './$types';

export const load: PageServerLoad = (event: RequestEvent) => {
	return {
		users: getUsers(),
		user: event.locals.user
	};
};
