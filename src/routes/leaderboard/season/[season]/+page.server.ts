import {
	getSeasonBySlug,
	getActiveSeason,
	getAttemptsBySeason,
	db_win_results_by_season
} from '$lib/server/db/functions';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

async function getLeaderboard(yearSlug?: string, clubId?: number | null) {
	const season = yearSlug ? await getSeasonBySlug(yearSlug) : await getActiveSeason();
	if (!season) {
		return { attempts: [], wins: [], season: null };
	}

	const [attempts, wins] = await Promise.all([
		getAttemptsBySeason(season.id, clubId),
		db_win_results_by_season(season.id, clubId)
	]);

	return { attempts, wins, season };
}

export const load: PageServerLoad = async (event) => {
	const season = event.params.season;
	const clubId = event.locals.activeClub?.id ?? null;

	const data = await getLeaderboard(season, clubId);

	if (!data.season) {
		throw error(404, `Season "${season}" not found`);
	}

	return { leaderboard: data };
};
