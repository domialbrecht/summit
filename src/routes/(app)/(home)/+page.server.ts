import { db } from '$lib/server/db';
import { eq, and, desc } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { StravaApi } from '$lib/activities';
import type { Actions, PageServerLoad } from './$types';
import { getUnparsedActivities } from '$lib/activities/activity_sync';
import { summitAttemptsFromActivity } from '$lib/activities/attempt';

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();

	const results = await db
		.select()
		.from(table.summit_attempt)
		.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
		.where(and(eq(table.summit_attempt.userId, user.id), eq(table.summit_attempt.published, true)))
		.orderBy(desc(table.summit_attempt.date))
		.limit(1);

	return {
		last_attempt: results.at(0)
	};
};

export const actions = {
	sync: async (event) => {
		const user = event.locals.user;
		if (!user) {
			redirect(401, '/login');
		}

		await StravaApi.updateActivityCache(user.id);

		const unparsed = await getUnparsedActivities(user.id);
		const summitMatches = await Promise.all(
			unparsed.map(async ({ id, date, sum_line }) => {
				const summits = await summitAttemptsFromActivity(sum_line);
				return { id: id, date: date, summits: summits.flatMap((s) => s.id) };
			})
		);

		const attempts = summitMatches
			.filter((m) => m.summits.length > 0)
			.flatMap((a) => {
				return a.summits.map((s) => {
					return {
						id: a.id,
						date: a.date,
						summit: s
					};
				});
			});

		if (attempts.length === 0) {
			return { success: true, message: 'no_match' };
		}

		await db.insert(table.summit_attempt).values(
			attempts.map((a) => {
				return {
					activityId: a.id,
					summitId: a.summit,
					userId: user.id,
					date: a.date
				};
			})
		);

		redirect(304, '/sync');
	}
} satisfies Actions;
