import { describe, it, expect } from 'vitest';
import { db } from '$lib/server/db/test-db';
import * as table from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

describe('Summit index query', () => {
	it('returns summits with required fields', async () => {
		const summits = await db.execute(sql`SELECT id, name, alias, lat, long FROM summit LIMIT 10`);

		expect(summits.length).toBeGreaterThan(0);
		for (const s of summits as Record<string, unknown>[]) {
			expect(s.id).toBeTypeOf('number');
			expect(s.name).toBeTypeOf('string');
			expect((s.name as string).length).toBeGreaterThan(0);
			expect(s.lat).toBeDefined();
			expect(s.long).toBeDefined();
			// lat/long should be valid coordinates
			const lat = Number(s.lat);
			const lng = Number(s.long);
			expect(lat).toBeGreaterThanOrEqual(-90);
			expect(lat).toBeLessThanOrEqual(90);
			expect(lng).toBeGreaterThanOrEqual(-180);
			expect(lng).toBeLessThanOrEqual(180);
		}
	});

	it('returns all summits (full index)', async () => {
		const summits = await db.execute(sql`SELECT id, name FROM summit`);
		// Should have a reasonable number of summits
		expect(summits.length).toBeGreaterThan(0);
	});
});

describe('Summit detail query', () => {
	it('loads a summit with its areas', async () => {
		// Get a summit that has area associations
		const [summitWithArea] = await db
			.select({ summitId: table.summitsToAreas.summitId })
			.from(table.summitsToAreas)
			.limit(1);

		if (!summitWithArea) {
			console.warn('Skipping: no summit-area associations in DB');
			return;
		}

		const result = await db
			.select({
				summit: table.summit,
				areas: sql<
					{ id: number; name: string }[]
				>`json_agg(json_build_object('id', area.id, 'name', area.name))`.as('areas')
			})
			.from(table.summit)
			.leftJoin(table.summitsToAreas, eq(table.summitsToAreas.summitId, table.summit.id))
			.leftJoin(table.area, eq(table.summitsToAreas.areaId, table.area.id))
			.where(eq(table.summit.id, summitWithArea.summitId))
			.groupBy(table.summit.id);

		expect(result.length).toBe(1);
		const row = result[0];
		expect(row.summit.id).toBe(summitWithArea.summitId);
		expect(row.summit.name).toBeTypeOf('string');
		expect(row.summit.name.length).toBeGreaterThan(0);
		expect(Array.isArray(row.areas)).toBe(true);
		expect(row.areas.length).toBeGreaterThan(0);
		expect(row.areas[0].id).toBeTypeOf('number');
		expect(row.areas[0].name).toBeTypeOf('string');
	});

	it('loads summit spatial data correctly', async () => {
		const [summit] = await db
			.select({
				id: table.summit.id,
				name: table.summit.name,
				lat: table.summit.lat,
				long: table.summit.long,
				elevation: table.summit.elevation
			})
			.from(table.summit)
			.limit(1);

		expect(summit).toBeDefined();
		expect(Number(summit.lat)).toBeGreaterThan(0); // Swiss summits are in the Northern Hemisphere
		expect(Number(summit.long)).toBeGreaterThan(0); // Swiss summits are east of Greenwich
	});
});

describe('Season query', () => {
	it('has an active season configured', async () => {
		const [activeSeason] = await db
			.select({
				id: table.season.id,
				name: table.season.name,
				startsAt: table.season.startsAt,
				endsAt: table.season.endsAt
			})
			.from(table.season)
			.where(eq(table.season.isActive, true))
			.limit(1);

		expect(activeSeason).toBeDefined();
		expect(activeSeason.name).toBeTypeOf('string');
		expect(activeSeason.startsAt).toBeInstanceOf(Date);
		expect(activeSeason.endsAt).toBeInstanceOf(Date);
		expect(activeSeason.endsAt.getTime()).toBeGreaterThan(activeSeason.startsAt.getTime());
	});

	it('returns all seasons ordered by start date', async () => {
		const seasons = await db
			.select({
				slug: table.season.slug,
				startsAt: table.season.startsAt,
				isActive: table.season.isActive
			})
			.from(table.season)
			.orderBy(sql`${table.season.startsAt} DESC`);

		expect(seasons.length).toBeGreaterThan(0);

		// Verify ordering (desc)
		for (let i = 1; i < seasons.length; i++) {
			expect(seasons[i - 1].startsAt.getTime()).toBeGreaterThanOrEqual(
				seasons[i].startsAt.getTime()
			);
		}

		// Exactly one active season
		const activeCount = seasons.filter((s) => s.isActive).length;
		expect(activeCount).toBe(1);
	});
});
