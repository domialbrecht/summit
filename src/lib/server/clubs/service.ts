import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import * as repo from './repository';
import { verifyStravaClubAdmin } from './strava-admin-check';
import { getTokensForUser } from '$lib/server/strava_auth';

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export async function registerClub(userId: string, stravaClubId: number) {
	// Check if club is already registered
	const existing = await repo.findClubByStravaId(stravaClubId);
	if (existing) {
		throw new Error('This Strava club is already registered.');
	}

	// Get user's access token
	const tokens = await getTokensForUser(userId);
	if (!tokens?.accessToken) {
		throw new Error('Could not retrieve Strava access token.');
	}

	// Verify user is an admin of the Strava club
	const { isAdmin, clubDetails } = await verifyStravaClubAdmin(stravaClubId, tokens.accessToken);

	if (!isAdmin || !clubDetails) {
		throw new Error('You must be an admin of this Strava club to register it.');
	}

	// Create club
	const slug = slugify(clubDetails.name);
	const club = await repo.createClub({
		slug,
		stravaClubId,
		name: clubDetails.name,
		description: clubDetails.description,
		profileImageUrl: clubDetails.profile_medium,
		createdBy: userId
	});

	// Add creator as admin member
	await repo.addMembership(userId, club.id, 'admin');

	return club;
}

export async function setActiveClub(sessionId: string, clubId: number | null, userId: string) {
	// If setting to a club, verify user is a member
	if (clubId !== null) {
		const membership = await repo.getMembership(userId, clubId);
		if (!membership) {
			throw new Error('You are not a member of this club.');
		}
	}

	await db
		.update(table.session)
		.set({ activeClubId: clubId })
		.where(eq(table.session.id, sessionId));
}

export async function resyncClub(userId: string, clubId: number) {
	const club = await repo.findClubById(clubId);
	if (!club) {
		throw new Error('Club not found.');
	}

	const membership = await repo.getMembership(userId, clubId);
	if (membership?.role !== 'admin') {
		throw new Error('Only club admins can resync.');
	}

	const tokens = await getTokensForUser(userId);
	if (!tokens?.accessToken) {
		throw new Error('Could not retrieve Strava access token.');
	}

	const { clubDetails } = await verifyStravaClubAdmin(club.stravaClubId, tokens.accessToken);
	if (!clubDetails) {
		throw new Error('Could not fetch club details from Strava.');
	}

	return repo.updateClub(clubId, {
		name: clubDetails.name,
		description: clubDetails.description,
		profileImageUrl: clubDetails.profile_medium
	});
}
