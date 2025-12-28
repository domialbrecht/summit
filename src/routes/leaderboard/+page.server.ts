import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const [active] = await db
		.select({ slug: table.season.slug })
		.from(table.season)
		.where(eq(table.season.isActive, true))
		.limit(1);

	if (!active) {
		throw error(500, 'No active season configured');
	}

	throw redirect(302, `/leaderboard/season/${active.slug}`);
};
