import { TokenBucket } from '$lib/server/rate-limit';
import { error, type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/session.js';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';

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
	if (dev && process.env.TEST_USER) {
		event.locals.user = {
			id: '104482993',
			stravaId: '104482993',
			firstName: 'DomiTest',
			lastName: 'test',
			ftp: '200',
			profile:
				'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZsYXNrLWNvbmljYWwiPjxwYXRoIGQ9Ik0xNCAydjZhMiAyIDAgMCAwIC4yNDUuOTZsNS41MSAxMC4wOEEyIDIgMCAwIDEgMTggMjJINmEyIDIgMCAwIDEtMS43NTUtMi45Nmw1LjUxLTEwLjA4QTIgMiAwIDAgMCAxMCA4VjIiLz48cGF0aCBkPSJNNi40NTMgMTVoMTEuMDk0Ii8+PHBhdGggZD0iTTguNSAyaDciLz48L3N2Zz4=',
			isAdmin: true
		};
		event.locals.session = {
			id: 'session-id',
			userId: '104482993',
			expiresAt: new Date(Date.now() + 1000 * 60 * 60)
		};
		return resolve(event);
	}

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
