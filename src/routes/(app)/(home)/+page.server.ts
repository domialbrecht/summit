import { db } from '$lib/server/db';
import { eq, and, desc } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { StravaApi } from '$lib/activities';
import type { Actions, PageServerLoad } from './$types';
import { getUnparsedActivities, setParsedActivities } from '$lib/activities/activity_sync';
import { summitAttemptsFromActivity } from '$lib/activities/attempt';
import logger from '$lib/logger';

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

		const updated = await StravaApi.updateActivityCache(user.id);

		const unparsed = await getUnparsedActivities(user.id);
		logger.info({
			message: 'Unparsed activiies',
			data: { user: user.id, unparsed: unparsed.length }
		});
		const summitMatches = await Promise.all(
			unparsed.map(async ({ id, date, sum_line }) => {
				const summits = await summitAttemptsFromActivity(sum_line);
				return { id: id, date: date, summits: summits.flatMap((s) => s.id) };
			})
		);

		logger.info({ message: 'Updating matches', data: { user: user.id, matches: summitMatches } });
		await setParsedActivities(summitMatches);

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
			logger.info({ message: 'No attempts matched' });
			return {
				success: true,
				message: { updated: updated, unparsed: unparsed.length, attempts: 0 }
			};
		}

		logger.info({ message: 'Inserting attempts', data: attempts.length });
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

		redirect(
			304,
			`/sync?updated=${updated}&unparsed=${unparsed.length}&attempts=${attempts.length}`
		);
	}
} satisfies Actions;
