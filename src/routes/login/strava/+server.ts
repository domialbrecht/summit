import { authorizationEndpoint, stravaClient, scopes } from '$lib/server/strava_auth';
import { generateState } from '$lib/server/oauth';

import type { RequestEvent } from './$types';

export function GET(event: RequestEvent): Response {
	const state = generateState();
	const url = stravaClient.createAuthorizationURL(authorizationEndpoint, state, scopes);

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
