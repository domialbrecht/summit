import type { RequestHandler } from './$types';
import * as table from '$lib/server/db/schema';

import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ setHeaders, url, locals }) => {
	const season = url.searchParams.get('season') ? true : false;
	const clubId = locals.activeClub?.id ?? null;

	const result = season ? await getSeasonData(clubId) : await getAllData(clubId);

	const geojson = result.at(0)?.geojson;

	setHeaders({
		'cache-control': clubId
			? 'private, max-age=3600, stale-while-revalidate=14400'
			: 'public, max-age=3600, stale-while-revalidate=14400'
	});
	return json(geojson);
};

function getSeasonData(clubId: number | null) {
	const attemptsSubquery = clubId
		? sql`(
				SELECT json_agg(wa.user_id)
				FROM (
					SELECT ${table.winActivitiesClubView.userId}
					FROM ${table.winActivitiesClubView}
					WHERE ${table.winActivitiesClubView.summitId} = ${table.summit}.id
					AND ${table.winActivitiesClubView.clubId} = ${clubId}
				) wa
			)`
		: sql`(
				SELECT json_agg(wa.user_id)
				FROM (
					SELECT ${table.winActivitiesView.userId}
					FROM ${table.winActivitiesView}
					WHERE ${table.winActivitiesView.summitId} = ${table.summit}.id
				) wa
			)`;

	return db
		.select({
			geojson: sql`json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(
        json_strip_nulls(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(location)::json,
            'properties', json_build_object(
              'id', id,
              'name', name,
              'elevation', elevation,
              'category', category,
              'desc', description,
              'attempts', ${attemptsSubquery}
            )
          )
        )
      )
    )`
		})
		.from(table.summit);
}

function getAllData(clubId: number | null) {
	const attemptsSubquery = clubId
		? sql`(
				SELECT json_agg(wa.user_id)
				FROM (
					SELECT ${table.winActivitiesBySeasonClubView.userId}
					FROM ${table.winActivitiesBySeasonClubView}
					WHERE ${table.winActivitiesBySeasonClubView.summitId} = ${table.summit}.id
					AND ${table.winActivitiesBySeasonClubView.clubId} = ${clubId}
				) wa
			)`
		: sql`(
				SELECT json_agg(wa.user_id)
				FROM (
					SELECT ${table.winActivitiesBySeasonView.userId}
					FROM ${table.winActivitiesBySeasonView}
					WHERE ${table.winActivitiesBySeasonView.summitId} = ${table.summit}.id
				) wa
			)`;

	return db
		.select({
			geojson: sql`json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(
        json_strip_nulls(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(location)::json,
            'properties', json_build_object(
              'id', id,
              'name', name,
              'elevation', elevation,
              'category', category,
              'desc', description,
              'attempts', ${attemptsSubquery}
            )
          )
        )
      )
    )`
		})
		.from(table.summit);
}
