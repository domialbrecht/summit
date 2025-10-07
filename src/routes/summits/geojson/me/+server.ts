import type { RequestHandler } from './$types';
import * as table from '$lib/server/db/schema';

import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ setHeaders, locals }) => {
	const user = locals.user;

	if (!user) {
		return json([]);
	}

	const result = await db
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
		.from(table.summit).where(sql`EXISTS (
			SELECT 1
			FROM ${table.summit_attempt}
			WHERE ${table.summit_attempt.summitId} = ${table.summit}.id
      AND ${table.summit_attempt.userId} = ${user.id}
		)`);
	const geojson = result.at(0)?.geojson;

	setHeaders({
		'cache-control': 'public, max-age=3600, stale-while-revalidate=14400'
	});
	return json(geojson);
};
