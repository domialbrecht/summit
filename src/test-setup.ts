import dotenvx from '@dotenvx/dotenvx';

dotenvx.config({ path: ['.env.local', '.env'] });

// Derive test database URL from the main DATABASE_URL
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.endsWith('_test')) {
	const lastSlash = process.env.DATABASE_URL.lastIndexOf('/');
	process.env.DATABASE_URL =
		process.env.DATABASE_URL.slice(0, lastSlash + 1) +
		process.env.DATABASE_URL.slice(lastSlash + 1) +
		'_test';
}
