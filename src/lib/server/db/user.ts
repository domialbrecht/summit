import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
export function getUsers() {
	return db.select().from(table.user);
}
