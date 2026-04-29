import { storeTokens, stravaClient, tokenEndpoint } from '$lib/server/strava_auth';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/session';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { syncUserClubMemberships } from '$lib/server/clubs';

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

	const stravaId = userResult.id.toString();
	const results = await db.select().from(table.user).where(eq(table.user.stravaId, stravaId));

	const existingUser = results.at(0);
	if (existingUser) {
		// Update profile, src might change
		const profile = userResult.profile;
		await db.update(table.user).set({ profile }).where(eq(table.user.id, stravaId));

		// Sync club memberships from Strava
		const memberships = await syncUserClubMemberships(existingUser.id, userResult.clubs ?? []);
		if (memberships.length === 0) {
			return new Response(null, {
				status: 302,
				headers: { location: '/login?noclub' }
			});
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		// Set active club to first membership
		await db
			.update(table.session)
			.set({ activeClubId: memberships[0].club.id })
			.where(eq(table.session.id, session.id));
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

		// Sync club memberships for new user
		const memberships = await syncUserClubMemberships(stravaId, userResult.clubs ?? []);
		if (memberships.length === 0) {
			return new Response(null, {
				status: 302,
				headers: { location: '/login?noclub' }
			});
		}

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, stravaId);
		// Set active club to first membership
		await db
			.update(table.session)
			.set({ activeClubId: memberships[0].club.id })
			.where(eq(table.session.id, session.id));
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
