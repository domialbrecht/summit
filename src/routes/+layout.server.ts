import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load: LayoutServerLoad = async (event: LayoutServerLoadEvent) => {
	return {
		user: event.locals.user,
		activeClub: event.locals.activeClub,
		userClubs: event.locals.userClubs
	};
};
