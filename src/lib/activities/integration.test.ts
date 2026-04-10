/**
 * Integration tests: activity upload → summit match → challenge create → challenge match
 *
 * Uses the test database (local_test) with seeded summits near the sample activity route.
 */
import { describe, it, expect, afterAll } from 'vitest';
import { db } from '$lib/server/db/test-db';
import * as table from '$lib/server/db/schema';
import { sql, eq, and } from 'drizzle-orm';
import polyline from '@mapbox/polyline';
import sampleActivity from '../../../doc/sample_activity.json';

const TEST_USER_ID = '104482993';
const TEST_ACTIVITY_ID = 'test-integration-' + Date.now();

// -- helpers (same spatial logic as production code, using test db) -----------

const toWKT = (decoded: [number, number][]) => {
	const wkt = decoded.map((c) => `${c[1]} ${c[0]}`).join(', ');
	return `LINESTRING(${wkt})`;
};

async function summitsMatchPolyline(line: string) {
	const p = polyline.decode(line);
	const wkt = toWKT(p);
	const sqlLine = sql`ST_GeographyFromText(${wkt})`;
	return db
		.select({ id: table.summit.id, name: table.summit.name })
		.from(table.summit)
		.where(sql`ST_DWithin(${table.summit.location}, ${sqlLine}, 50)`);
}

async function summitDetailMatch(activityId: string) {
	const BUFFER = 20;
	const query = sql`
		SELECT MIN(ST_M(pt)) as matchtime, contained.id, contained.name FROM
		(
			SELECT (dp).geom as pt, s.id, s.name, s.location FROM
			(
				SELECT
					ST_DumpPoints((SELECT linestring FROM strava_activity WHERE id = ${activityId})) as dp,
					summit.location, summit.id, summit.name
				FROM summit WHERE ST_DWithin(
					ST_Transform((SELECT linestring FROM strava_activity WHERE id = ${activityId}), 4326),
					summit.location, ${BUFFER}
				)
			) as s
			WHERE ST_Contains(ST_Buffer(s.location, ${BUFFER})::geometry, (dp).geom)
		) as contained GROUP BY contained.id, contained.name
	`;
	return [...(await db.execute<{ id: number; name: string; matchtime: number }>(query))];
}

// -- cleanup -----------------------------------------------------------------

afterAll(async () => {
	// Remove test activity and everything cascaded from it
	await db.delete(table.activity).where(eq(table.activity.id, TEST_ACTIVITY_ID));
	// Remove challenges created in this test run (by slug prefix)
	await db.delete(table.challenge).where(sql`${table.challenge.slug} LIKE 'test-challenge-%'`);
});

// -- 1. Upload a new activity ------------------------------------------------

describe('1. Upload a new activity', () => {
	it('inserts an activity with polyline data', async () => {
		await db.insert(table.activity).values({
			id: TEST_ACTIVITY_ID,
			userId: TEST_USER_ID,
			uploadId: 'test-upload-1',
			name: 'Test Integration Ride',
			distance: Math.round(sampleActivity.distance),
			movingTime: String(sampleActivity.moving_time),
			elapsedTime: String(sampleActivity.elapsed_time),
			totalElevationGain: String(sampleActivity.total_elevation_gain),
			type: sampleActivity.type,
			startDate: new Date(sampleActivity.start_date),
			averageSpeed: String(sampleActivity.average_speed),
			maxSpeed: String(sampleActivity.max_speed),
			averageWatts: String(sampleActivity.average_watts),
			summaryPolyline: sampleActivity.map.summary_polyline
		});

		const [row] = await db
			.select({ id: table.activity.id, name: table.activity.name })
			.from(table.activity)
			.where(eq(table.activity.id, TEST_ACTIVITY_ID));

		expect(row).toBeDefined();
		expect(row.name).toBe('Test Integration Ride');
	});
});

// -- 2. Match summits from activity ------------------------------------------

describe('2. Match summits from activity polyline', () => {
	it('coarse match finds at least one seeded summit', async () => {
		const matches = await summitsMatchPolyline(sampleActivity.map.summary_polyline);
		expect(matches.length).toBeGreaterThan(0);

		const ids = matches.map((m) => m.id);
		// At least one of our seeded summits should match
		const seededIds = [90001, 90002, 90003, 90004];
		const overlap = ids.filter((id) => seededIds.includes(id));
		expect(overlap.length).toBeGreaterThan(0);
	});
});

// -- 3. Create a challenge ---------------------------------------------------

let challengeId: number;
const CHALLENGE_SLUG = 'test-challenge-' + Date.now();

describe('3. Create a challenge', () => {
	it('inserts a challenge with points near the activity route', async () => {
		// Use coordinates of seeded summits as challenge points
		const [newChallenge] = await db
			.insert(table.challenge)
			.values({
				slug: CHALLENGE_SLUG,
				name: 'Test Integration Challenge',
				description: 'Created by integration test',
				type: 'one_time',
				ordered: false,
				createdBy: TEST_USER_ID,
				createdAt: new Date()
			})
			.returning({ id: table.challenge.id });

		challengeId = newChallenge.id;

		// Insert challenge points at summit locations (on the polyline)
		await db.insert(table.challengePoint).values([
			{
				challengeId,
				summitId: 90001,
				sortOrder: 0,
				name: 'Test Summit Start',
				lat: '47.063230',
				long: '7.615160',
				location: { x: 7.61516, y: 47.06323 }
			},
			{
				challengeId,
				summitId: 90003,
				sortOrder: 1,
				name: 'Test Summit Late',
				lat: '47.184340',
				long: '7.634100',
				location: { x: 7.6341, y: 47.18434 }
			}
		]);

		const points = await db
			.select()
			.from(table.challengePoint)
			.where(eq(table.challengePoint.challengeId, challengeId));

		expect(points.length).toBe(2);

		// Join as participant
		await db.insert(table.challengeParticipant).values({
			challengeId,
			userId: TEST_USER_ID
		});
	});
});

// -- 4. Upload activity with linestring (detail data) ------------------------

describe('4. Upload activity with detail linestring', () => {
	it('adds LINESTRINGM geometry from polyline coords', async () => {
		// Build a fake LINESTRINGM from the detailed polyline with ascending M values
		const coords = polyline.decode(sampleActivity.map.polyline);
		// Use a subset for performance (every 10th point) with ascending timestamps
		const sampled = coords.filter((_, i) => i % 10 === 0);
		const wkt = sampled.map((c, i) => `${c[1]} ${c[0]} ${i * 10}`).join(', ');
		const linestring = `SRID=4326;LINESTRINGM(${wkt})`;

		await db
			.update(table.activity)
			.set({ linestring })
			.where(eq(table.activity.id, TEST_ACTIVITY_ID));

		const [row] = await db
			.select({ linestring: table.activity.linestring })
			.from(table.activity)
			.where(eq(table.activity.id, TEST_ACTIVITY_ID));

		expect(row.linestring).toBeTruthy();
	});
});

// -- 5. Match activity to challenge ------------------------------------------

describe('5. Match activity to challenge', () => {
	it('detail match finds summits from linestring', async () => {
		const detailMatches = await summitDetailMatch(TEST_ACTIVITY_ID);
		expect(detailMatches.length).toBeGreaterThan(0);
		for (const m of detailMatches) {
			expect(m.matchtime).toBeTypeOf('number');
			expect(m.matchtime).toBeGreaterThanOrEqual(0);
		}
	});

	it('submits activity to challenge and records attempt', async () => {
		// Coarse match challenge points
		const coarseMatches = await db
			.select({ id: table.challengePoint.id })
			.from(table.challengePoint)
			.where(
				and(
					eq(table.challengePoint.challengeId, challengeId),
					sql`ST_DWithin(
						${table.challengePoint.location},
						ST_GeographyFromText(${toWKT(polyline.decode(sampleActivity.map.summary_polyline))}),
						50
					)`
				)
			);

		expect(coarseMatches.length).toBeGreaterThan(0);

		// Detail match challenge points
		const detailQuery = sql`
			SELECT MIN(ST_M(pt)) as matchtime, contained.id FROM
			(
				SELECT (dp).geom as pt, cplines.id, cplines.location FROM
				(
					SELECT
						ST_DumpPoints((SELECT linestring FROM strava_activity WHERE id = ${TEST_ACTIVITY_ID})) as dp,
						cp.location, cp.id
					FROM challenge_point cp
					WHERE cp.challenge_id = ${challengeId}
					  AND ST_DWithin(
						ST_Transform((SELECT linestring FROM strava_activity WHERE id = ${TEST_ACTIVITY_ID}), 4326),
						cp.location, 20
					  )
				) as cplines
				WHERE ST_Contains(ST_Buffer(cplines.location, 20)::geometry, (dp).geom)
			) as contained GROUP BY contained.id
		`;
		const detailMatches = await db.execute<{ id: number; matchtime: number }>(detailQuery);

		const allPoints = await db
			.select({ id: table.challengePoint.id })
			.from(table.challengePoint)
			.where(eq(table.challengePoint.challengeId, challengeId));

		const matchedIds = [...detailMatches].map((m) => m.id);
		const completed = matchedIds.length === allPoints.length;

		// Record the attempt
		const [attempt] = await db
			.insert(table.challengeAttempt)
			.values({
				challengeId,
				userId: TEST_USER_ID,
				activityId: TEST_ACTIVITY_ID,
				completed,
				submittedAt: new Date()
			})
			.returning({ id: table.challengeAttempt.id });

		expect(attempt.id).toBeTypeOf('number');

		// Record point matches
		if (detailMatches.length > 0) {
			await db.insert(table.challengePointMatch).values(
				[...detailMatches].map((m) => ({
					challengeAttemptId: attempt.id,
					challengePointId: m.id,
					matchedAt: String(m.matchtime)
				}))
			);
		}

		// Verify the attempt was saved
		const [savedAttempt] = await db
			.select()
			.from(table.challengeAttempt)
			.where(eq(table.challengeAttempt.id, attempt.id));

		expect(savedAttempt).toBeDefined();
		expect(savedAttempt.challengeId).toBe(challengeId);
		expect(savedAttempt.activityId).toBe(TEST_ACTIVITY_ID);

		// Verify point matches were recorded
		const pointMatches = await db
			.select()
			.from(table.challengePointMatch)
			.where(eq(table.challengePointMatch.challengeAttemptId, attempt.id));

		expect(pointMatches.length).toBeGreaterThan(0);
	});
});
