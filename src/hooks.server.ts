import { TokenBucket } from '$lib/server/rate-limit';
import { error, type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/session.js';
import { sequence } from '@sveltejs/kit/hooks';

const bucket = new TokenBucket<string>(100, 1);

const rateLimitHandle: Handle = async ({ event, resolve }) => {
	const clientIp = event.request.headers.get('X-Forwarded-For');
	if (clientIp === null) {
		return resolve(event);
	}

	let cost: number;
	if (event.request.method === 'GET' || event.request.method === 'OPTIONS') {
		cost = 1;
	} else {
		cost = 3;
	}
	if (!bucket.consume(clientIp, cost)) {
		error(429, { message: 'Too many requests' });
	}
	return resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = sequence(rateLimitHandle, authHandle);
