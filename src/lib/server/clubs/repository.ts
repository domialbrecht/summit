import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';

export async function findClubById(id: number) {
	const [c] = await db.select().from(table.club).where(eq(table.club.id, id)).limit(1);
	return c ?? null;
}

export async function findClubBySlug(slug: string) {
	const [c] = await db.select().from(table.club).where(eq(table.club.slug, slug)).limit(1);
	return c ?? null;
}

export async function findClubByStravaId(stravaClubId: number) {
	const [c] = await db
		.select()
		.from(table.club)
		.where(eq(table.club.stravaClubId, stravaClubId))
		.limit(1);
	return c ?? null;
}

export async function listClubsForUser(userId: string) {
	return db
		.select({
			club: table.club,
			role: table.userClub.role,
			joinedAt: table.userClub.joinedAt
		})
		.from(table.userClub)
		.innerJoin(table.club, eq(table.club.id, table.userClub.clubId))
		.where(eq(table.userClub.userId, userId));
}

export async function listAllClubs() {
	return db.select().from(table.club);
}

export async function createClub(data: {
	slug: string;
	stravaClubId: number;
	name: string;
	description?: string;
	profileImageUrl?: string;
	createdBy: string;
}) {
	const [c] = await db.insert(table.club).values(data).returning();
	return c;
}

export async function updateClub(
	id: number,
	data: { name?: string; description?: string | null; profileImageUrl?: string | null }
) {
	const [c] = await db.update(table.club).set(data).where(eq(table.club.id, id)).returning();
	return c;
}

export async function addMembership(userId: string, clubId: number, role: string = 'member') {
	await db.insert(table.userClub).values({ userId, clubId, role }).onConflictDoNothing();
}

export async function removeMembership(userId: string, clubId: number) {
	await db
		.delete(table.userClub)
		.where(and(eq(table.userClub.userId, userId), eq(table.userClub.clubId, clubId)));
}

export async function setRole(userId: string, clubId: number, role: string) {
	await db
		.update(table.userClub)
		.set({ role })
		.where(and(eq(table.userClub.userId, userId), eq(table.userClub.clubId, clubId)));
}

export async function getMembership(userId: string, clubId: number) {
	const [m] = await db
		.select()
		.from(table.userClub)
		.where(and(eq(table.userClub.userId, userId), eq(table.userClub.clubId, clubId)))
		.limit(1);
	return m ?? null;
}
