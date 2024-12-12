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

	const results = await db.select().from(table.user).where(eq(table.user.stravaId, stravaId));

	const existingUser = results.at(0);
	if (existingUser) {
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

async function storeTokens(userId: string, tokens: OAuth2Tokens) {
	const accessToken = tokens.accessToken();
	const refreshToken = tokens.refreshToken();
	const expiresAt = tokens.accessTokenExpiresAt();

	const results = await db.select().from(table.tokens).where(eq(table.tokens.userId, userId));

	const exixtingTokens = results.at(0);
	if (exixtingTokens) {
		await db
			.update(table.tokens)
			.set({
				accessToken,
				refreshToken,
				expiresAt
			})
			.where(eq(table.tokens.userId, userId));
	} else {
		await db.insert(table.tokens).values({
			id: userId,
			userId,
			accessToken,
			refreshToken,
			expiresAt
		});
	}
}
