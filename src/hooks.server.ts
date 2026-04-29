import { TokenBucket } from '$lib/server/rate-limit';
import { error, type Handle, type HandleServerError } from '@sveltejs/kit';
import * as auth from '$lib/server/session';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import logger from '$lib/logger';
import { listClubsForUser, findClubByStravaId, addMembership } from '$lib/server/clubs';

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
		// Ensure test user is admin of SolyVC club
		const solyvc = await findClubByStravaId(1196981);
		if (solyvc) {
			await addMembership('104482993', solyvc.id, 'admin');
		}
		const userClubs = await listClubsForUser('104482993');
		const activeClub = solyvc ?? userClubs[0]?.club ?? null;
		event.locals.session = {
			id: 'session-id',
			userId: '104482993',
			expiresAt: new Date(Date.now() + 1000 * 60 * 60),
			activeClubId: activeClub?.id ?? null
		};
		event.locals.userClubs = userClubs;
		event.locals.activeClub = activeClub;
		return resolve(event);
	}

	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = undefined;
		event.locals.session = null;
		event.locals.activeClub = null;
		event.locals.userClubs = [];
		return resolve(event);
	}

	const { session, user, activeClub } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	// Populate club context
	if (user && session) {
		const userClubs = await listClubsForUser(user.id);
		event.locals.userClubs = userClubs;
		event.locals.activeClub = activeClub;
	} else {
		event.locals.userClubs = [];
		event.locals.activeClub = null;
	}

	return resolve(event);
};

export const handle: Handle = sequence(rateLimitHandle, authHandle);

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	logger.error({
		message: message,
		error: error,
		url: event.url.pathname,
		status: status
	});

	return {
		message: 'Server Error'
	};
};
