/**
 * Creates a fresh test database, runs migrations, and seeds baseline data.
 *
 * Usage: npx tsx scripts/test-db-setup.ts
 *
 * Reads DATABASE_URL from .env.local / .env and derives a _test database.
 */
import postgres from 'postgres';
import dotenvx from '@dotenvx/dotenvx';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

dotenvx.config({ path: ['.env.local', '.env'] });

const baseUrl = process.env.DATABASE_URL;
if (!baseUrl) throw new Error('DATABASE_URL is not set');

// Derive test DB name from base URL (e.g. postgres://user:pass@host:5432/local → local_test)
const lastSlash = baseUrl.lastIndexOf('/');
const baseDbName = baseUrl.slice(lastSlash + 1);
const testDbName = `${baseDbName}_test`;
const testUrl = baseUrl.slice(0, lastSlash + 1) + testDbName;
const adminUrl = baseUrl.slice(0, lastSlash + 1) + 'postgres';

async function main() {
	// Connect to the default "postgres" database for admin operations
	const adminClient = postgres(adminUrl, { max: 1 });

	console.log(`Dropping and recreating database "${testDbName}"...`);
	// Terminate existing connections
	await adminClient.unsafe(
		`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${testDbName}' AND pid <> pg_backend_pid()`
	);
	await adminClient.unsafe(`DROP DATABASE IF EXISTS "${testDbName}"`);
	await adminClient.unsafe(`CREATE DATABASE "${testDbName}"`);
	await adminClient.end();

	// Connect to the test database
	const testClient = postgres(testUrl, { max: 1 });
	const db = drizzle(testClient);

	// Enable PostGIS
	console.log('Enabling PostGIS...');
	await testClient.unsafe('CREATE EXTENSION IF NOT EXISTS postgis');

	// Run migrations
	console.log('Running migrations...');
	await migrate(db, { migrationsFolder: 'drizzle' });

	// Seed baseline data
	console.log('Seeding test data...');
	await seed(testClient);

	await testClient.end();
	console.log(`Test database "${testDbName}" ready at ${testUrl}`);
}

async function seed(sql: postgres.Sql) {
	// Test user (matches hooks.server.ts TEST_USER)
	await sql`
		INSERT INTO "user" (id, first_name, last_name, strava_id, profile, ftp, is_admin)
		VALUES (
			'104482993',
			'DomiTest',
			'test',
			'104482993',
			'https://example.com/avatar.png',
			'200',
			true
		)
		ON CONFLICT (id) DO NOTHING
	`;

	// Active season (covers 2026)
	await sql`
		INSERT INTO season (slug, name, starts_at, ends_at, is_active)
		OVERRIDING SYSTEM VALUE
		VALUES
			('2025', 'Season 2025', '2025-01-01', '2026-01-01', false),
			('2026', 'Season 2026', '2026-01-10', '2026-12-24', true)
	`;

	// Areas
	await sql`
		INSERT INTO area (name) VALUES ('Jura'), ('Solothurn'), ('Bern')
	`;

	// Summits placed directly ON the sample_activity summary polyline path.
	// Coordinates are exact decoded polyline points to guarantee 50m spatial match.
	//   idx 0  → 47.063230, 7.615160 (start area, near Bern)
	//   idx 150 → 47.072750, 7.846790 (mid route)
	//   idx 270 → 47.184340, 7.634100 (latter part of route)
	//   idx 300 → 47.200970, 7.546800 (near Solothurn region)
	await sql`
		INSERT INTO summit (id, slug, name, lat, long, location, elevation, category)
		VALUES
			(90001, 'test-summit-start', 'Test Summit Start', '47.063230', '7.615160', ST_SetSRID(ST_MakePoint(7.615160, 47.063230), 4326), 550, 4),
			(90002, 'test-summit-mid',   'Test Summit Mid',   '47.072750', '7.846790', ST_SetSRID(ST_MakePoint(7.846790, 47.072750), 4326), 780, 3),
			(90003, 'test-summit-late',  'Test Summit Late',  '47.184340', '7.634100', ST_SetSRID(ST_MakePoint(7.634100, 47.184340), 4326), 650, 4),
			(90004, 'test-summit-end',   'Test Summit End',   '47.200970', '7.546800', ST_SetSRID(ST_MakePoint(7.546800, 47.200970), 4326), 920, 3)
	`;

	// Summit-to-area mappings
	await sql`
		INSERT INTO summits_to_areas (summit_id, area_id)
		SELECT 90001, id FROM area WHERE name = 'Bern'
		UNION ALL
		SELECT 90002, id FROM area WHERE name = 'Bern'
		UNION ALL
		SELECT 90003, id FROM area WHERE name = 'Solothurn'
		UNION ALL
		SELECT 90004, id FROM area WHERE name = 'Solothurn'
	`;

	console.log('Seeded: user, seasons, areas, summits');

	// Activity that went through summit 90001 (Test Summit Start)
	await sql`
		INSERT INTO strava_activity (id, user_id, upload_id, name, distance, moving_time, elapsed_time, total_elevation_gain, type, start_date, summary_polyline)
		VALUES (
			'seed-activity-1',
			'104482993',
			'seed-upload-1',
			'Seed Ride',
			50000,
			'7200',
			'7500',
			'800',
			'Ride',
			'2026-03-15T10:00:00Z',
			'dummy'
		)
	`;

	// Published summit attempt → creates a "win" for active season
	await sql`
		INSERT INTO summit_attempt (summit_id, user_id, activity_id, date, published, season_id)
		VALUES (90001, '104482993', 'seed-activity-1', '2026-03-15T11:30:00Z', true, 2)
	`;

	console.log('Seeded: activity, summit attempt (win)');
}

main().catch((e) => {
	console.error('Test DB setup failed:', e);
	process.exit(1);
});
