import type { RequestHandler } from './$types';
import * as table from '$lib/server/db/schema';

import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ setHeaders }) => {
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
              'attempt', EXISTS (
                SELECT 1 
                FROM ${table.summit_attempt} 
                WHERE ${table.summit_attempt}.summit_id = ${table.summit}.id
                AND ${table.summit_attempt.published} = TRUE
              )
            )
          )
        )
      )
    )`
		})
		.from(table.summit);

	const geojson = result.at(0)?.geojson;

	setHeaders({
		'cache-control': 'public, max-age=3600, stale-while-revalidate=14400'
	});

	return json(geojson);
};
