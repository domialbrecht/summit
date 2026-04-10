import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL not set — is .env.local loaded?');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);
