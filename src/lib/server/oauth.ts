import { Strava } from 'arctic';
import { AUTH_STRAVA_CLIENT_ID, AUTH_STRAVA_CLIENT_SECRET } from '$env/static/private';

export const strava = new Strava(
	AUTH_STRAVA_CLIENT_ID,
	AUTH_STRAVA_CLIENT_SECRET,
	'http://localhost:5173/auth/strava/callback'
);
