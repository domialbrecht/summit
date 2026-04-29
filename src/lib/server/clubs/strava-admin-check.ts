import logger from '$lib/logger';

interface StravaClubDetails {
	id: number;
	name: string;
	description: string;
	profile_medium: string;
	member_count: number;
	admin: boolean;
	owner: boolean;
}

export async function verifyStravaClubAdmin(
	stravaClubId: number,
	accessToken: string
): Promise<{ isAdmin: boolean; clubDetails: StravaClubDetails | null }> {
	const clubRes = await fetch(`https://www.strava.com/api/v3/clubs/${stravaClubId}`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (!clubRes.ok) {
		logger.error({ message: 'Failed to fetch Strava club details', status: clubRes.status });
		return { isAdmin: false, clubDetails: null };
	}

	const clubDetails: StravaClubDetails = await clubRes.json();

	logger.info({
		message: 'Strava club details response',
		clubId: stravaClubId,
		admin: clubDetails.admin,
		owner: clubDetails.owner
	});

	return { isAdmin: clubDetails.admin || clubDetails.owner, clubDetails };
}
