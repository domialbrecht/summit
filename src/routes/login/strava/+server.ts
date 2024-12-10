import { strava } from '$lib/server/oauth';
import { generateState } from 'arctic';

import type { RequestEvent } from './$types';

export function GET(event: RequestEvent): Response {
	const state = generateState();
	const url = strava.createAuthorizationURL(state, ['user:email']);

	event.cookies.set('strava_oauth_state', state, {
		httpOnly: true,
		maxAge: 60 * 10,
		secure: import.meta.env.PROD,
		path: '/',
		sameSite: 'lax'
	});

	return new Response(null, {
		status: 302,
		headers: {
			location: url.toString()
		}
	});
}
