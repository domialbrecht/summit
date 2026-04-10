import { describe, it, expect, afterAll } from 'vitest';
import { db } from '$lib/server/db/test-db';
import * as table from '$lib/server/db/schema';
import { eq, and, notExists, sql } from 'drizzle-orm';

describe('getUnparsedActivities logic', () => {
	it('returns activities that have no entry in parseActivityResults', async () => {
		// Query for any user that has activities
		const [someUser] = await db.select({ id: table.activity.userId }).from(table.activity).limit(1);

		if (!someUser) {
			console.warn('Skipping: no activities in DB');
			return;
		}

		// Get unparsed activities using the same logic as the production code
		const unparsed = await db
			.select({
				id: table.activity.id,
				sum_line: table.activity.summaryPolyline,
				date: table.activity.startDate
			})
			.from(table.activity)
			.where(
				and(
					eq(table.activity.userId, someUser.id),
					notExists(
						db
							.select()
							.from(table.parseActivityResults)
							.where(eq(table.parseActivityResults.activityId, table.activity.id))
					)
				)
			);

		expect(Array.isArray(unparsed)).toBe(true);
		for (const a of unparsed) {
			expect(a.id).toBeTypeOf('string');
			expect(a.date).toBeInstanceOf(Date);
		}

		// Every returned activity should NOT exist in parseActivityResults
		for (const a of unparsed.slice(0, 5)) {
			const [parsed] = await db
				.select({ id: table.parseActivityResults.id })
				.from(table.parseActivityResults)
				.where(eq(table.parseActivityResults.activityId, a.id))
				.limit(1);
			expect(parsed).toBeUndefined();
		}
	});
});

describe('updateActivities upsert', () => {
	const TEST_ACTIVITY_ID = '__test_upsert_activity__';
	const TEST_USER_ID = '__test_user__';

	// Clean up after tests
	afterAll(async () => {
		await db.delete(table.activity).where(eq(table.activity.id, TEST_ACTIVITY_ID));
		await db.delete(table.user).where(eq(table.user.id, TEST_USER_ID));
	});

	it('inserts a new activity and updates it on conflict', async () => {
		// Ensure test user exists (FK constraint)
		await db
			.insert(table.user)
			.values({
				id: TEST_USER_ID,
				stravaId: '__test_strava_id__',
				firstName: 'Test',
				lastName: 'User'
			})
			.onConflictDoNothing();

		// Insert
		await db.insert(table.activity).values({
			id: TEST_ACTIVITY_ID,
			userId: TEST_USER_ID,
			uploadId: '123',
			name: 'Original Name',
			distance: 1000,
			movingTime: '3600',
			elapsedTime: '4000',
			totalElevationGain: '500',
			type: 'Ride',
			startDate: new Date('2026-01-15T10:00:00Z'),
			averageSpeed: '5.0',
			maxSpeed: '10.0',
			summaryPolyline: 'test_polyline'
		});

		const [inserted] = await db
			.select({ name: table.activity.name, distance: table.activity.distance })
			.from(table.activity)
			.where(eq(table.activity.id, TEST_ACTIVITY_ID));

		expect(inserted.name).toBe('Original Name');
		expect(inserted.distance).toBe(1000);

		// Upsert (update on conflict)
		await db
			.insert(table.activity)
			.values({
				id: TEST_ACTIVITY_ID,
				userId: TEST_USER_ID,
				uploadId: '123',
				name: 'Updated Name',
				distance: 2000,
				movingTime: '3600',
				elapsedTime: '4000',
				totalElevationGain: '500',
				type: 'Ride',
				startDate: new Date('2026-01-15T10:00:00Z'),
				averageSpeed: '5.0',
				maxSpeed: '10.0',
				summaryPolyline: 'test_polyline'
			})
			.onConflictDoUpdate({
				target: table.activity.id,
				set: {
					name: sql.raw(`excluded.${table.activity.name.name}`),
					distance: sql.raw(`excluded.${table.activity.distance.name}`)
				}
			});

		const [updated] = await db
			.select({ name: table.activity.name, distance: table.activity.distance })
			.from(table.activity)
			.where(eq(table.activity.id, TEST_ACTIVITY_ID));

		expect(updated.name).toBe('Updated Name');
		expect(updated.distance).toBe(2000);
	});
});
