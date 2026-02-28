import type { RequestHandler } from './$types';
import * as table from '$lib/server/db/schema';

import { db } from '$lib/server/db';
import { sql, desc } from 'drizzle-orm';
import { checkEtagCache, jsonWithCache, PUBLIC_GEOJSON_CACHE } from '$lib/server/cache';

export const GET: RequestHandler = async ({ setHeaders, url, request }) => {
	const season = url.searchParams.get('season') ? true : false;

	const latestAttempt = await db
		.select({ id: table.summit_attempt.id, date: table.summit_attempt.date })
		.from(table.summit_attempt)
		.where(sql`${table.summit_attempt.published} = true`)
		.orderBy(desc(table.summit_attempt.id))
		.limit(1);

	const etag = latestAttempt[0]
		? `"${latestAttempt[0].id}-${season ? 'season' : 'all'}"`
		: '"no-attempts"';

	const cachedResponse = checkEtagCache(
		request.headers.get('if-none-match'),
		etag,
		PUBLIC_GEOJSON_CACHE
	);
	if (cachedResponse) {
		return cachedResponse;
	}

	const result = season ? await getSeasonData() : await getAllData();
	const geojson = result.at(0)?.geojson;

	return jsonWithCache(geojson, setHeaders, { etag, cacheControl: PUBLIC_GEOJSON_CACHE });
};

function getSeasonData() {
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
              'attempts', (
                SELECT json_agg(wa.user_id)
                FROM (
                  SELECT ${table.winActivitiesView.userId} 
                  FROM ${table.winActivitiesView} 
                  WHERE ${table.winActivitiesView.summitId} = ${table.summit}.id
                ) wa
              )
            )
          )
        )
      )
    )`
		})
		.from(table.summit);
}

function getAllData() {
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
              'attempts', (
                SELECT json_agg(wa.user_id)
                FROM (
                  SELECT ${table.winActivitiesBySeasonView.userId} 
                  FROM ${table.winActivitiesBySeasonView} 
                  wHERE ${table.winActivitiesBySeasonView.summitId} = ${table.summit}.id
                ) wa
              )
            )
          )
        )
      )
    )`
		})
		.from(table.summit);
}
