import { getUsers } from '$lib/server/db/user';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = () => {
	return {
		users: getUsers()
	};
};
