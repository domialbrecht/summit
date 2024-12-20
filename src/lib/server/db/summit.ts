import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getSummit(id: number) {
	const results = await db.select().from(table.summit).where(eq(table.summit.id, id));

	return results.at(0);
}
