import { storeTokens, stravaClient, tokenEndpoint } from '$lib/server/strava_auth';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/session';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import type { OAuth2Tokens } from '$lib/server/oauth';
import type { RequestEvent } from './$types';
import { error } from '@sveltejs/kit';
import logger from '$lib/logger';

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
	let stravaAccessToken;
	try {
		tokens = await stravaClient.validateAuthorizationCode(tokenEndpoint, code, null);
		stravaAccessToken = tokens.accessToken();
	} catch (e) {
		logger.error({ message: 'Failed to get access tokens', data: e });
		error(400, {
			message: 'Failed to validate authorization code'
		});
	}

	const userRequest = new Request('https://www.strava.com/api/v3/athlete');
	userRequest.headers.set('Authorization', `Bearer ${stravaAccessToken}`);
	const userResponse = await fetch(userRequest);
	const userResult = await userResponse.json();
	const SOLYVC_CLUB = 1196981;

	if (
		!userResult.clubs ||
		!userResult.clubs.some((club: { id: number }) => club.id === SOLYVC_CLUB)
	) {
		return new Response(null, {
			status: 302,
			headers: {
				location: '/login?noclub'
			}
		});
	}

	const stravaId = userResult.id.toString();
	const results = await db.select().from(table.user).where(eq(table.user.stravaId, stravaId));

	const existingUser = results.at(0);
	if (existingUser) {
		// Update profile, src might change
		const profile = userResult.profile;
		await db.update(table.user).set({ profile }).where(eq(table.user.id, stravaId));

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		await storeTokens(existingUser.id, tokens);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				location: '/'
			}
		});
	}

	// Athlete data
	const ftp = userResult.ftp;
	const profile = userResult.profile;
	const firstName = userResult.firstname;
	const lastName = userResult.lastname;

	try {
		await db
			.insert(table.user)
			.values({ id: stravaId, stravaId, firstName, lastName, profile, ftp });

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, stravaId);
		await storeTokens(stravaId, tokens);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		console.error(e);
		error(404, {
			message: 'An error has occurred'
		});
	}
}
