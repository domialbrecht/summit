import { getUsers } from '$lib/server/db/user';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		users: getUsers()
	};
};
