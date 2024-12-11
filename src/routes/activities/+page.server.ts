import { StravaDb } from '$lib/strava';

export async function load() {
	const userActivities = await StravaDb.getActities();

	return {
		userActivities: userActivities
	};
}
