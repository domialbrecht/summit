import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export async function load() {
	return {
		summitPromise: db.select().from(table.summit)
	};
}
