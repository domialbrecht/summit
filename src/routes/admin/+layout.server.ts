import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load: LayoutServerLoad = async (event: LayoutServerLoadEvent) => {
	if (!event.locals.user?.isAdmin) {
		redirect(302, '/');
	}
	return {
		user: event.locals.user
	};
};
