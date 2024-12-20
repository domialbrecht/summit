import type { PageServerLoad } from './$types.js';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	let summit = null;
	if (params.id) {
		const result = await db
			.select()
			.from(table.summit)
			.where(eq(table.summit.id, parseInt(params.id)));
		summit = result.at(0);
	}

	if (params.id && !summit) {
		error(404, { message: 'Summit not found' });
	}

	return {
		summit: summit
	};
};
