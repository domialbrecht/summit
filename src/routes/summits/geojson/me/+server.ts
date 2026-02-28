import type { RequestHandler } from './$types';
import * as table from '$lib/server/db/schema';

import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { sql, desc, and, eq } from 'drizzle-orm';
import { checkEtagCache, jsonWithCache, PRIVATE_GEOJSON_CACHE } from '$lib/server/cache';

export const GET: RequestHandler = async ({ setHeaders, locals, request }) => {
	const user = locals.user;

	if (!user) {
		return json([]);
	}

	const latestAttempt = await db
		.select({ id: table.summit_attempt.id, date: table.summit_attempt.date })
		.from(table.summit_attempt)
		.where(
			and(eq(table.summit_attempt.userId, user.id), sql`${table.summit_attempt.published} = true`)
		)
		.orderBy(desc(table.summit_attempt.id))
		.limit(1);

	const etag = latestAttempt[0]
		? `"${latestAttempt[0].id}-${user.id}"`
		: `"no-attempts-${user.id}"`;

	const cachedResponse = checkEtagCache(
		request.headers.get('if-none-match'),
		etag,
		PRIVATE_GEOJSON_CACHE
	);
	if (cachedResponse) {
		return cachedResponse;
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

	return jsonWithCache(geojson, setHeaders, { etag, cacheControl: PRIVATE_GEOJSON_CACHE });
};
