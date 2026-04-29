import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import * as repo from './repository';

interface StravaClub {
	id: number;
	name: string;
}

/**
 * Sync a user's club memberships based on the clubs array returned by Strava's /athlete endpoint.
 * Only touches clubs that are registered in our DB. Does not auto-remove admin roles.
 */
export async function syncUserClubMemberships(userId: string, stravaClubs: StravaClub[]) {
	const registeredClubs = await db.select().from(table.club);
	const registeredStravaIds = new Set(registeredClubs.map((c) => c.stravaClubId));

	// Strava clubs that match registered clubs
	const matchedClubs = stravaClubs.filter((sc) => registeredStravaIds.has(sc.id));
	const matchedClubMap = new Map(
		matchedClubs.map((sc) => {
			const dbClub = registeredClubs.find((c) => c.stravaClubId === sc.id)!;
			return [dbClub.id, dbClub];
		})
	);

	// Current memberships
	const currentMemberships = await db
		.select()
		.from(table.userClub)
		.where(eq(table.userClub.userId, userId));

	const currentClubIds = new Set(currentMemberships.map((m) => m.clubId));

	// Add new memberships
	for (const [clubId] of matchedClubMap) {
		if (!currentClubIds.has(clubId)) {
			await repo.addMembership(userId, clubId, 'member');
		}
	}

	// Remove memberships where the user is no longer in the Strava club,
	// but never remove admin roles automatically
	for (const membership of currentMemberships) {
		if (!matchedClubMap.has(membership.clubId) && membership.role !== 'admin') {
			await repo.removeMembership(userId, membership.clubId);
		}
	}

	// Return the user's current club memberships after sync
	return repo.listClubsForUser(userId);
}
