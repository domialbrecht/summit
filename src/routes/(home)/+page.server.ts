import type { RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	return {
		user: event.locals.user
	};
}
