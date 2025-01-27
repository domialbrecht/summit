import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

export async function main() {
	try {
		console.log('Running migration...');
		await migrate(db, { migrationsFolder: 'drizzle' });
		console.log('Migration complete');
	} catch (e) {
		console.error('Migration failed', e);
	}
	process.exit(0);
}

main();
