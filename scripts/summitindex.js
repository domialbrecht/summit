import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenvx from '@dotenvx/dotenvx';
import { sql } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

dotenvx.config({
	path: ['.env.local', '.env']
});

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function generateIndex() {
	// Fetch summits from the database (this depends on how you connect to your DB)
	const summits = await db.execute(sql`SELECT id, name, alias, lat, long FROM summit`);

	// Create a JSON index (you can customize this structure)
	const index = summits.map((summit) => ({
		id: summit.id,
		name: summit.name,
		lat: summit.lat,
		long: summit.long,
		alias: summit.alias
	}));

	// Write the index to a JSON file
	const outputPath = path.resolve('static', 'summit-index.json');
	fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

	console.log('Summit index generated!');
}

generateIndex().finally(() => client.end());
