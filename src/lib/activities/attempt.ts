import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import polyline from '@mapbox/polyline';
import { sql } from 'drizzle-orm';

const THRESHHOLD_METERS = 50;

const toWKT = (decoded: [number, number][]) => {
	const wkt = decoded.map((coord) => `${coord[1]} ${coord[0]}`).join(', '); // lon lat order
	return `LINESTRING(${wkt})`;
};

async function summitsMatchPolyline(line: string) {
	const p = polyline.decode(line);
	const wkt = toWKT(p);
	const sqlLine = sql`ST_GeographyFromText(${wkt})`;
	const summits = await db
		.select({
			id: table.summit.id,
			name: table.summit.name,
			location: table.summit.location,
			matchPoint: sql`ST_ClosestPoint(${table.summit.location},${sqlLine})`
		})
		.from(table.summit)
		.where(sql`ST_DWithin(${table.summit.location},${sqlLine},${THRESHHOLD_METERS})`);
	return summits;
}

export async function summitDetailMatch(activityId: string) {
	const BUFFER = 20;
	const query = sql`
    SELECT MIN(ST_M(pt)) as matchtime, contained.id, contained.name FROM 
    (
      SELECT (dp).geom as pt, summitlines.id, summitlines.name, summitlines.location FROM 
      (
        SELECT 
          ST_DumpPoints((SELECT linestring FROM strava_activity WHERE id = ${activityId})) as dp,
          summit.location,
          summit.id,
          summit.name
          from summit where ST_DWithin(
            ST_Transform((SELECT linestring FROM strava_activity WHERE id = ${activityId}),4326),
            summit.location,
            ${BUFFER}
          )
      ) as summitlines
      WHERE ST_Contains(ST_Buffer(summitlines.location,${BUFFER})::geometry, (dp).geom)
    ) as contained group by contained.id, contained.name
  `;

	const results = await db.execute<{ id: number; name: string; matchtime: number }>(query);
	return [...results];
}

export async function summitAttemptsFromActivity(line: string) {
	const summits = await summitsMatchPolyline(line);
	return summits;
}
