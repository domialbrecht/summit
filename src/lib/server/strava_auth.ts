import { OAuth2Client, OAuth2Tokens } from '$lib/server/oauth';
import { AUTH_STRAVA_CLIENT_ID, AUTH_STRAVA_CLIENT_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import logger from '$lib/logger';

export const authorizationEndpoint = 'https://www.strava.com/oauth/authorize';
export const tokenEndpoint = 'https://www.strava.com/oauth/token';
export const scopes = ['activity:read,read,profile:read_all'];

export const stravaClient = new OAuth2Client(
	AUTH_STRAVA_CLIENT_ID,
	AUTH_STRAVA_CLIENT_SECRET,
	'http://localhost:5173/login/strava/callback'
);

export async function getTokensForUser(userId: string) {
	const results = await db.select().from(table.tokens).where(eq(table.tokens.userId, userId));

	const tokens = results.at(0);
	if (!tokens) {
		return null;
	}
	if (tokens.refreshToken && tokens.expiresAt.getTime() <= Date.now()) {
		try {
			const new_tokens = await stravaClient.refreshAccessToken(
				tokenEndpoint,
				tokens.refreshToken,
				scopes
			);
			tokens.accessToken = new_tokens.accessToken();
			await storeTokens(userId, new_tokens);
		} catch (e) {
			logger.error(e);
			error(400, {
				message: 'Failed to validate authorization code'
			});
		}
	}

	return tokens;
}

export async function storeTokens(userId: string, tokens: OAuth2Tokens) {
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
