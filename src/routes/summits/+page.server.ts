import { StravaDb } from '$lib/strava';

export async function load() {
	return {
		userActivities: StravaDb.getActities()
	};
}
