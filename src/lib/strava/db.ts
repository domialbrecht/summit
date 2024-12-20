import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getActities() {
	return db
		.select({
			user: table.user,
			activity: table.activity
		})
		.from(table.activity)
		.innerJoin(table.user, eq(table.activity.userId, table.user.id))
		.where(eq(table.activity.userId, table.user.id));
}
