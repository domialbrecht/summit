import { strava } from '$lib/server/oauth';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/session';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import type { OAuth2Tokens } from 'arctic';
import type { RequestEvent } from './$types';
import { error } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get('strava_oauth_state');
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	if (storedState === null || code === null || state === null) {
		error(400, {
			message: 'Please start the process'
		});
	}

	if (storedState !== state) {
		error(400, {
			message: 'Please restart the process'
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await strava.validateAuthorizationCode(code);
	} catch {
		error(400, {
			message: 'Failed to validate authorization code'
		});
	}

	const stravaAccessToken = tokens.accessToken();

	const userRequest = new Request('https://www.strava.com/api/v3/athlete');
	userRequest.headers.set('Authorization', `Bearer ${stravaAccessToken}`);
	const userResponse = await fetch(userRequest);
	const userResult = await userResponse.json();
	const stravaId = userResult.id.toString();
	const email = userResult.email;

	const results = await db.select().from(table.user).where(eq(table.user.stravaId, stravaId));

	const existingUser = results.at(0);
	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				location: '/'
			}
		});
	}

	try {
		await db.insert(table.user).values({ id: stravaId, stravaId, email });

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, stravaId);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch {
		error(404, {
			message: 'An error has occurred'
		});
	}
}
