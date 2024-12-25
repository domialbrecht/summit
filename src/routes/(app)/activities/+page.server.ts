import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();

	const result = await db
		.select({
			name: table.activity.name,
			distance: table.activity.distance,
			start: table.activity.startDate,
			match: table.parseActivityResults.hasMatch
		})
		.from(table.activity)
		.leftJoin(
			table.parseActivityResults,
			eq(table.parseActivityResults.activityId, table.activity.id)
		)
		.where(eq(table.activity.userId, user.id))
		.limit(20);

	return {
		activities: result
	};
};
