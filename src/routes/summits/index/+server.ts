import type { RequestHandler } from './$types';

import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ setHeaders }) => {
	const summits = await db.execute(sql`SELECT id, name, alias, lat, long FROM summit`);

	// Create a JSON index (you can customize this structure)
	const index = summits.map((summit) => ({
		id: summit.id,
		name: summit.name,
		lat: summit.lat,
		long: summit.long,
		alias: summit.alias
	}));

	setHeaders({
		'cache-control': 'public, max-age=86400, stale-while-revalidate=86400'
	});
	return json(index);
};
