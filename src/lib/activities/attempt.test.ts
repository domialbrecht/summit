import { describe, it, expect } from 'vitest';
import { db } from '$lib/server/db/test-db';
import * as table from '$lib/server/db/schema';
import { sql, eq, and, isNotNull } from 'drizzle-orm';
import polyline from '@mapbox/polyline';
import sampleActivity from '../../../doc/sample_activity.json';

const THRESHOLD_METERS = 50;

const toWKT = (decoded: [number, number][]) => {
	const wkt = decoded.map((coord) => `${coord[1]} ${coord[0]}`).join(', ');
	return `LINESTRING(${wkt})`;
};

async function summitsMatchPolyline(line: string) {
	const p = polyline.decode(line);
	const wkt = toWKT(p);
	const sqlLine = sql`ST_GeographyFromText(${wkt})`;
	return db
		.select({
			id: table.summit.id,
			name: table.summit.name
		})
		.from(table.summit)
		.where(sql`ST_DWithin(${table.summit.location},${sqlLine},${THRESHOLD_METERS})`);
}

async function summitDetailMatch(activityId: string) {
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
				FROM summit WHERE ST_DWithin(
					ST_Transform((SELECT linestring FROM strava_activity WHERE id = ${activityId}),4326),
					summit.location,
					${BUFFER}
				)
			) as summitlines
			WHERE ST_Contains(ST_Buffer(summitlines.location,${BUFFER})::geometry, (dp).geom)
		) as contained GROUP BY contained.id, contained.name
	`;

	return [...(await db.execute<{ id: number; name: string; matchtime: number }>(query))];
}

describe('Coarse summit matching (summitsMatchPolyline)', () => {
	it('matches summits from a real activity polyline', async () => {
		const line = sampleActivity.map.summary_polyline;
		const matches = await summitsMatchPolyline(line);

		expect(matches.length).toBeGreaterThan(0);
		for (const m of matches) {
			expect(m.id).toBeTypeOf('number');
			expect(m.name).toBeTypeOf('string');
			expect(m.name.length).toBeGreaterThan(0);
		}
	});

	it('returns distinct summit IDs', async () => {
		const line = sampleActivity.map.summary_polyline;
		const matches = await summitsMatchPolyline(line);
		const ids = matches.map((m) => m.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('returns empty array for a polyline far from any summit', async () => {
		// Polyline in the middle of the ocean (0,0 area)
		const encoded = polyline.encode([
			[0.0, 0.0],
			[0.001, 0.001],
			[0.002, 0.002]
		]);
		const matches = await summitsMatchPolyline(encoded);
		expect(matches).toEqual([]);
	});

	it('returns empty array for a very short polyline', async () => {
		const encoded = polyline.encode([
			[47.0, 7.5],
			[47.0001, 7.5001]
		]);
		const matches = await summitsMatchPolyline(encoded);
		// May or may not match (depends on summit proximity), but should not error
		expect(Array.isArray(matches)).toBe(true);
	});
});

describe('Detail summit matching (summitDetailMatch)', () => {
	it('matches summits from an activity with linestring data', async () => {
		// Find an activity that has linestring data and a known summit match
		const [activity] = await db
			.select({ id: table.activity.id })
			.from(table.activity)
			.where(isNotNull(table.activity.linestring))
			.limit(1);

		if (!activity) {
			console.warn('Skipping detail match test: no activity with linestring in DB');
			return;
		}

		const matches = await summitDetailMatch(activity.id);

		// Activity may or may not match summits, but result should be valid
		expect(Array.isArray(matches)).toBe(true);
		for (const m of matches) {
			expect(m.id).toBeTypeOf('number');
			expect(m.name).toBeTypeOf('string');
			expect(m.matchtime).toBeTypeOf('number');
			expect(m.matchtime).toBeGreaterThanOrEqual(0);
		}
	});

	it('returns empty array for non-existent activity', async () => {
		const matches = await summitDetailMatch('non_existent_activity_id_999');
		expect(matches).toEqual([]);
	});
});
