import type { PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { lt, asc, and, sql, eq, count } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { UserSummitWin } from '$lib/types';

async function getSummitMedals(summitId: string | undefined) {
	if (!summitId) {
		return [];
	}

	const attemptAcounts = db.$with('attemptCounts').as(
		db
			.select({
				user_id: table.summit_attempt.userId,
				attempt_count: count(table.summit_attempt.id).as('attempt_count')
			})
			.from(table.summit_attempt)
			.where(
				and(
					eq(table.summit_attempt.summitId, parseInt(summitId)),
					eq(table.summit_attempt.published, true)
				)
			)
			.groupBy(table.summit_attempt.userId)
	);

	const rankedUsers = db.$with('rankedUsers').as(
		db
			.select({
				user_id: attemptAcounts.user_id,
				attempt_count: attemptAcounts.attempt_count,
				rank: sql`dense_rank() over (order by ${attemptAcounts.attempt_count} desc)`.as('rank')
			})
			.from(attemptAcounts)
	);

	const result = await db
		.with(attemptAcounts, rankedUsers)
		.select({
			username: table.user.firstName,
			attempts: rankedUsers.attempt_count,
			rank: rankedUsers.rank
		})
		.from(rankedUsers)
		.innerJoin(table.user, eq(table.user.id, rankedUsers.user_id))
		.where(lt(rankedUsers.rank, 4))
		.orderBy(asc(rankedUsers.rank));
	return result;
}

async function getSummitWins(summitId: string | undefined): Promise<UserSummitWin[]> {
	if (!summitId) {
		return [];
	}

	const win_result = await db
		.select({
			winAttempt: table.summit_attempt,
			username: table.user.firstName,
			profile: table.user.profile
		})
		.from(table.winActivitiesView)
		.innerJoin(
			table.summit_attempt,
			and(
				eq(table.winActivitiesView.activityId, table.summit_attempt.activityId),
				eq(table.winActivitiesView.summitId, table.summit_attempt.summitId)
			)
		)
		.innerJoin(table.user, eq(table.user.id, table.winActivitiesView.userId))
		.where(eq(table.winActivitiesView.summitId, parseInt(summitId)));

	const get_media_for_win = win_result.map(async (win) => {
		const result = await db
			.select({ url: table.activityMedia.url })
			.from(table.activityMedia)
			.where(eq(table.activityMedia.activityId, win.winAttempt.activityId))
			.limit(1);
		const media = result.at(0);
		return {
			...win,
			media: media ? media.url : null
		};
	});
	const wins_with_picture = await Promise.all(get_media_for_win);

	return wins_with_picture;
}

async function getSummitProfiles(
	summitId: string | undefined
): Promise<Pick<table.SelectSummitProfile, 'name' | 'segment' | 'data'>[]> {
	if (!summitId) {
		return [];
	}
	return await db
		.select({
			name: table.summit_profile.name,
			segment: table.summit_profile.segment,
			data: table.summit_profile.data
		})
		.from(table.summit_profile)
		.where(eq(table.summit_profile.summitId, parseInt(summitId)));
}

export const load: PageServerLoad = async ({ params }) => {
	let summit_data:
		| {
				summit: table.SelectSummit;
				areas: table.SelectArea[];
		  }
		| undefined = undefined;
	if (params.id) {
		const result = await db
			.select({
				summit: table.summit,
				areas: sql<
					table.SelectArea[]
				>`json_agg(json_build_object('id', area.id, 'name', area.name))`.as('areas')
			})
			.from(table.summit)
			.leftJoin(table.summitsToAreas, eq(table.summitsToAreas.summitId, table.summit.id))
			.leftJoin(table.area, eq(table.summitsToAreas.areaId, table.area.id))
			.where(eq(table.summit.id, parseInt(params.id)))
			.groupBy(table.summit.id);
		summit_data = result.at(0);
	}

	if (params.id && !summit_data) {
		error(404, { message: 'Summit not found' });
	}

	return {
		summit_medals: getSummitMedals(params.id),
		summit_wins: getSummitWins(params.id),
		summit_profiles: getSummitProfiles(params.id),
		summit_data: summit_data
	};
};
