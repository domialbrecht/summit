import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug;

	if (!slug) {
		error(400, { message: 'Missing slug' });
	}

	const [challenge] = await db
		.select({
			id: table.challenge.id,
			name: table.challenge.name,
			description: table.challenge.description,
			ordered: table.challenge.ordered
		})
		.from(table.challenge)
		.where(eq(table.challenge.slug, slug))
		.limit(1);

	if (!challenge) {
		error(404, { message: 'Challenge not found' });
	}

	const points = await db
		.select({
			name: table.challengePoint.name,
			description: table.challengePoint.description,
			lat: table.challengePoint.lat,
			long: table.challengePoint.long,
			sortOrder: table.challengePoint.sortOrder,
			summitName: table.summit.name,
			summitElevation: table.summit.elevation
		})
		.from(table.challengePoint)
		.leftJoin(table.summit, eq(table.challengePoint.summitId, table.summit.id))
		.where(eq(table.challengePoint.challengeId, challenge.id))
		.orderBy(table.challengePoint.sortOrder);

	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	const waypoints = points
		.map((p) => {
			const name = p.summitName ?? p.name ?? 'Point';
			const ele = p.summitElevation ? `\n      <ele>${p.summitElevation}</ele>` : '';
			const desc = p.description ? `\n      <desc>${esc(p.description)}</desc>` : '';
			return `    <wpt lat="${p.lat}" lon="${p.long}">
      <name>${esc(name)}</name>${ele}${desc}
    </wpt>`;
		})
		.join('\n');

	let route = '';
	if (challenge.ordered) {
		const rtepts = points
			.map((p) => {
				const name = p.summitName ?? p.name ?? 'Point';
				const ele = p.summitElevation ? `\n        <ele>${p.summitElevation}</ele>` : '';
				return `      <rtept lat="${p.lat}" lon="${p.long}">
        <name>${esc(name)}</name>${ele}
      </rtept>`;
			})
			.join('\n');
		route = `
    <rte>
      <name>${esc(challenge.name)}</name>
${rtepts}
    </rte>`;
	}

	const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Summit"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${esc(challenge.name)}</name>
  </metadata>
${waypoints}${route}
</gpx>`;

	const filename = challenge.name.replace(/[^a-zA-Z0-9_-]/g, '_') + '.gpx';

	return new Response(gpx, {
		headers: {
			'Content-Type': 'application/gpx+xml',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
