import { db } from '$lib/server/db';
import { eq, and, desc } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { StravaApi } from '$lib/activities';
import type { Actions, PageServerLoad } from './$types';
import { getUnparsedActivities, setParsedActivities } from '$lib/activities/activity_sync';
import { summitAttemptsFromActivity, summitDetailMatch } from '$lib/activities/attempt';
import logger from '$lib/logger';

const FETCHED_LIST_COOKIE_NAME = 'strava_list_fetched';
const FETCHED_DETAIL_COOKIE_NAME = 'strava_detail_fetched';

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

		let updated = 0;
		if (!event.cookies.get(FETCHED_LIST_COOKIE_NAME)) {
			updated = await StravaApi.updateActivityCache(user.id);
			const expires = new Date(Date.now() + 1000 * 60 * 60);
			event.cookies.set(FETCHED_LIST_COOKIE_NAME, 'true', {
				expires: expires,
				path: '/'
			});
		} else {
			logger.info({ message: 'Skipping activity fetch, recently fetched' });
		}

		logger.info({ message: 'Getting unparsed activities', data: { user: user.id } });
		const unparsed = await getUnparsedActivities(user.id);
		logger.info({
			message: 'Unparsed activiies',
			data: { user: user.id, unparsed: unparsed.length }
		});

		if (unparsed.length === 0) {
			redirect(303, `/sync?updated=${updated}&unparsed=${0}&attempts=${0}`);
		}

		let summitMatches: {
			id: string;
			date: Date;
			summits: number[];
			detail_summits: {
				id: number;
				name: string;
				matchtime: number;
			}[];
		}[] = await Promise.all(
			unparsed.map(async ({ id, date, sum_line }) => {
				const summits = await summitAttemptsFromActivity(sum_line);
				return { id: id, date: date, summits: summits.flatMap((s) => s.id), detail_summits: [] };
			})
		);

		summitMatches = summitMatches.filter((m) => m.summits.length > 0);
		for (const activity of summitMatches) {
			if (!event.cookies.get(FETCHED_DETAIL_COOKIE_NAME)) {
				logger.info({ message: 'Sync photos', data: { activity: activity.id } });
				StravaApi.syncPhotos(user.id, activity.id);

				logger.info({ message: 'Getting detail stream', data: { activity: activity.id } });
				await StravaApi.updateActivityDetail(user.id, activity.id);

				const expires = new Date(Date.now() + 1000 * 60 * 60);
				event.cookies.set(FETCHED_DETAIL_COOKIE_NAME, 'true', {
					expires: expires,
					path: '/'
				});
			} else {
				logger.info({ message: 'Skipping detail fetch, recently fetched' });
			}

			logger.info({ message: 'Matching summit details', data: { activity: activity.id } });
			activity.detail_summits = await summitDetailMatch(activity.id);
		}

		logger.info({ message: 'Updating matches', data: { user: user.id, matches: summitMatches } });
		await setParsedActivities(summitMatches);

		const attempts = summitMatches.flatMap((a) => {
			return a.detail_summits.map((s) => {
				const reachTime = s.matchtime;
				const reachDate = new Date(a.date.getTime() + reachTime * 1000);
				return {
					id: a.id,
					date: reachDate,
					summit: s.id
				};
			});
		});

		if (attempts.length === 0) {
			logger.info({ message: 'No new attempts matched' });
			redirect(303, `/sync?updated=${updated}&unparsed=${unparsed.length}&attempts=${0}`);
		}

		logger.info({ message: 'Inserting attempts', data: attempts });
		try {
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
		} catch (e) {
			throw new Error(`Failed to insert attempts: ${e}`);
		}

		redirect(
			303,
			`/sync?updated=${updated}&unparsed=${unparsed.length}&attempts=${attempts.length}`
		);
	}
} satisfies Actions;
