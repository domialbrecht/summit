/**
 * Fetch a cycling route from BRouter between the given waypoints.
 *
 * @param waypoints Array of [lng, lat] coordinate pairs
 * @param profile BRouter profile (default: 'fastbike' for road cycling)
 * @param signal Optional AbortSignal to cancel the request
 * @returns Array of [lng, lat] coordinates forming the route, or null if fewer than 2 waypoints / on error
 */
export async function fetchBRouterRoute(
	waypoints: [number, number][],
	profile = 'fastbike',
	signal?: AbortSignal
): Promise<[number, number][] | null> {
	if (waypoints.length < 2) return null;

	const lonlats = waypoints.map(([lng, lat]) => `${lng},${lat}`).join('|');
	const url = `https://brouter.de/brouter?lonlats=${lonlats}&profile=${profile}&alternativeidx=0&format=geojson`;

	const response = await fetch(url, { signal });
	if (!response.ok) return null;

	const geojson = await response.json();
	const feature = geojson.features?.[0];
	if (!feature?.geometry?.coordinates) return null;

	return feature.geometry.coordinates.map((c: number[]) => [c[0], c[1]] as [number, number]);
}
