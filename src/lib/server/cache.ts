import { json } from '@sveltejs/kit';

interface CacheOptions {
	etag: string;
	cacheControl: string;
}

/**
 * Handle ETag-based caching for API responses
 * Returns a 304 Not Modified response if the client's ETag matches,
 * otherwise returns null to indicate the caller should proceed with generating the response
 */
export function checkEtagCache(
	clientEtag: string | null,
	etag: string,
	cacheControl: string
): Response | null {
	if (clientEtag === etag) {
		return new Response(null, {
			status: 304,
			headers: {
				'cache-control': cacheControl,
				etag
			}
		});
	}
	return null;
}

/**
 * Create a JSON response with appropriate cache headers and ETag
 */
export function jsonWithCache(
	data: unknown,
	setHeaders: (headers: Record<string, string>) => void,
	options: CacheOptions
) {
	setHeaders({
		'cache-control': options.cacheControl,
		etag: options.etag
	});
	return json(data);
}

/**
 * Standard cache control for public GeoJSON data (5 min cache, 1 day stale)
 */
export const PUBLIC_GEOJSON_CACHE = 'public, max-age=300, stale-while-revalidate=86400';

/**
 * Standard cache control for private user-specific GeoJSON data (5 min cache, 1 day stale)
 */
export const PRIVATE_GEOJSON_CACHE = 'private, max-age=300, stale-while-revalidate=86400';
