import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const seasons = await db
		.select({
			slug: table.season.slug,
			name: table.season.name,
			startsAt: table.season.startsAt,
			endsAt: table.season.endsAt,
			isActive: table.season.isActive
		})
		.from(table.season)
		.orderBy(desc(table.season.isActive), desc(table.season.startsAt), asc(table.season.slug));

	return { seasons };
};
