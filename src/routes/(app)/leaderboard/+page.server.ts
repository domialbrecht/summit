import { summitAttemptsFromActivity } from '$lib/activities/attempt';
import type { RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	await summitAttemptsFromActivity('');
	console.log('DEBUG');
	return {
		a: 1
	};
}
