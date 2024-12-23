import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import polyline from '@mapbox/polyline';
import { sql } from 'drizzle-orm';

const THRESHHOLD_METERS = 50;

const toWKT = (decoded: [number, number][]) => {
	const wkt = decoded.map((coord) => `${coord[1]} ${coord[0]}`).join(', '); // lon lat order
	return `LINESTRING(${wkt})`;
};

async function summitsMatchPolyline(line: string): Promise<{ id: number }[]> {
	const p = polyline.decode(line);
	const wkt = toWKT(p);
	const sqlLine = sql`ST_GeographyFromText(${wkt})`;
	const summits = await db
		.select({
			id: table.summit.id,
			name: table.summit.name,
			location: table.summit.location,
			distance: sql`ST_Distance(${table.summit.location},${sqlLine})`
		})
		.from(table.summit)
		.where(sql`ST_DWithin(${table.summit.location},${sqlLine},${THRESHHOLD_METERS})`);
	return summits;
}

export async function summitAttemptsFromActivity(line: string): Promise<{ id: number }[]> {
	const summits = await summitsMatchPolyline(line);
	return summits;
}
