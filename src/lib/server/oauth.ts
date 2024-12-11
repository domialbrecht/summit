import { Strava } from 'arctic';
import { AUTH_STRAVA_CLIENT_ID, AUTH_STRAVA_CLIENT_SECRET } from '$env/static/private';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const strava = new Strava(
	AUTH_STRAVA_CLIENT_ID,
	AUTH_STRAVA_CLIENT_SECRET,
	'http://localhost:5173/login/strava/callback'
);

export async function getTokensForUser(userId: string) {
	const results = await db.select().from(table.tokens).where(eq(table.tokens.userId, userId));

	const tokens = results.at(0);
	if (!tokens || tokens.expiresAt.getTime() <= Date.now()) {
		return null;
	}

	return tokens;
}

export async function refreshTokens() {
	//TODO
}
