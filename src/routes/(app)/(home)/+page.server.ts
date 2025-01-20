import { db } from '$lib/server/db';
import { eq, and, desc } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { StravaApi } from '$lib/activities';
import type { Actions, PageServerLoad } from './$types';
import { syncWithCount } from '$lib/activities/attempt';
import logger from '$lib/logger';

const FETCHED_LIST_COOKIE_NAME = 'strava_list_fetched';

async function user_last_attempt(userId: string) {
	const results = await db
		.select()
		.from(table.summit_attempt)
		.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
		.where(and(eq(table.summit_attempt.userId, userId), eq(table.summit_attempt.published, true)))
		.orderBy(desc(table.summit_attempt.date))
		.limit(1);

	return results.at(0);
}

async function last_attempts() {
	const results = await db
		.select({
			id: table.summit.id,
			name: table.summit.name,
			date: table.summit_attempt.date,
			firstName: table.user.firstName,
			lastName: table.user.lastName,
			profile: table.user.profile
		})
		.from(table.summit_attempt)
		.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
		.innerJoin(table.user, eq(table.summit_attempt.userId, table.user.id))
		.where(and(eq(table.summit_attempt.published, true)))
		.orderBy(desc(table.summit_attempt.date))
		.limit(5);

	return results;
}

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();

	return {
		last_attempt: user_last_attempt(user.id),
		last_attempts: last_attempts()
	};
};

export const actions = {
	sync: async (event) => {
		const user = event.locals.user;
		if (!user) {
			redirect(401, '/login');
		}

		let updated = 0;
		let skipDetailFetch = false;
		if (!event.cookies.get(FETCHED_LIST_COOKIE_NAME)) {
			const new_activities = await StravaApi.manualFetch(user.id);
			updated = await StravaApi.updateActivityCache(user.id, new_activities);
			const expires = new Date(Date.now() + 1000 * 60 * 60);
			event.cookies.set(FETCHED_LIST_COOKIE_NAME, 'true', {
				expires: expires,
				path: '/'
			});
		} else {
			skipDetailFetch = true;
			logger.info({ message: 'Skipping activity fetch, recently fetched' });
		}

		const { unparsed, attempts } = await syncWithCount(user.id, skipDetailFetch);

		redirect(303, `/sync?updated=${updated}&unparsed=${unparsed}&attempts=${attempts}`);
	}
} satisfies Actions;
