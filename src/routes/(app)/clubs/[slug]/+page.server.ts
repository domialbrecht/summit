import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { findClubBySlug, getMembership, resyncClub } from '$lib/server/clubs';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	const club = await findClubBySlug(event.params.slug);
	if (!club) {
		error(404, { message: 'Club not found' });
	}

	const user = event.locals.user;
	const membership = user ? await getMembership(user.id, club.id) : null;

	if (!membership) {
		error(403, { message: 'You are not a member of this club.' });
	}

	const members = await db
		.select({
			userId: table.userClub.userId,
			role: table.userClub.role,
			joinedAt: table.userClub.joinedAt,
			firstName: table.user.firstName,
			lastName: table.user.lastName,
			profile: table.user.profile
		})
		.from(table.userClub)
		.innerJoin(table.user, eq(table.user.id, table.userClub.userId))
		.where(eq(table.userClub.clubId, club.id));

	return {
		club,
		membership,
		members
	};
};

export const actions: Actions = {
	resync: async (event) => {
		const user = event.locals.user;
		if (!user) {
			return fail(401);
		}
		const club = await findClubBySlug(event.params.slug);
		if (!club) {
			return fail(404, { error: 'Club not found' });
		}
		try {
			await resyncClub(user.id, club.id);
		} catch (e) {
			return fail(400, { error: e instanceof Error ? e.message : 'Resync failed.' });
		}
		return { success: true };
	}
};
