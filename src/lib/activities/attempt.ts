import logger from '$lib/logger';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import polyline from '@mapbox/polyline';
import { sql } from 'drizzle-orm';
import { getUnparsedActivities, setParsedActivities } from './activity_sync';
import { StravaApi } from '.';

const THRESHHOLD_METERS = 50;

export async function syncWithCount(
	userId: string,
	skipDetailFetch = false
): Promise<{
	unparsed: number;
	attempts: number;
}> {
	logger.info({ message: 'Getting unparsed activities', data: { user: userId } });
	const unparsed = await getUnparsedActivities(userId);
	logger.info({
		message: 'Unparsed activiies',
		data: { user: userId, unparsed: unparsed.length }
	});

	if (unparsed.length === 0) {
		return { unparsed: 0, attempts: 0 };
	}

	let summitMatches: {
		id: string;
		date: Date;
		summits: number[];
		detail_summits: {
			id: number;
			name: string;
			matchtime: number;
		}[];
	}[] = await Promise.all(
		unparsed.map(async ({ id, date, sum_line }) => {
			const summits = await summitAttemptsFromActivity(sum_line);
			return { id: id, date: date, summits: summits.flatMap((s) => s.id), detail_summits: [] };
		})
	);

	summitMatches = summitMatches.filter((m) => m.summits.length > 0);
	for (const activity of summitMatches) {
		if (!skipDetailFetch) {
			logger.info({ message: 'Sync photos', data: { activity: activity.id } });
			StravaApi.syncPhotos(userId, activity.id);

			logger.info({ message: 'Getting detail stream', data: { activity: activity.id } });
			await StravaApi.updateActivityDetail(userId, activity.id);
		} else {
			logger.info({ message: 'Skipping detail fetch, recently fetched' });
		}

		logger.info({ message: 'Matching summit details', data: { activity: activity.id } });
		activity.detail_summits = await summitDetailMatch(activity.id);
	}

	logger.info({ message: 'Updating matches', data: { user: userId, matches: summitMatches } });
	await setParsedActivities(summitMatches);

	const attempts = summitMatches.flatMap((a) => {
		return a.detail_summits.map((s) => {
			const reachTime = s.matchtime;
			const reachDate = new Date(a.date.getTime() + reachTime * 1000);
			return {
				id: a.id,
				date: reachDate,
				summit: s.id
			};
		});
	});

	if (attempts.length === 0) {
		logger.info({ message: 'No new attempts matched' });
		return { unparsed: unparsed.length, attempts: 0 };
	}

	logger.info({ message: 'Inserting attempts', data: attempts });
	try {
		await db.insert(table.summit_attempt).values(
			attempts.map((a) => {
				return {
					activityId: a.id,
					summitId: a.summit,
					userId: userId,
					date: a.date
				};
			})
		);
	} catch (e) {
		throw new Error(`Failed to insert attempts: ${e}`);
	}

	return { unparsed: unparsed.length, attempts: attempts.length };
}

const toWKT = (decoded: [number, number][]) => {
	const wkt = decoded.map((coord) => `${coord[1]} ${coord[0]}`).join(', '); // lon lat order
	return `LINESTRING(${wkt})`;
};

async function summitsMatchPolyline(line: string) {
	const p = polyline.decode(line);
	const wkt = toWKT(p);
	const sqlLine = sql`ST_GeographyFromText(${wkt})`;
	const summits = await db
		.select({
			id: table.summit.id,
			name: table.summit.name,
			location: table.summit.location,
			matchPoint: sql`ST_ClosestPoint(${table.summit.location},${sqlLine})`
		})
		.from(table.summit)
		.where(sql`ST_DWithin(${table.summit.location},${sqlLine},${THRESHHOLD_METERS})`);
	return summits;
}

export async function summitDetailMatch(activityId: string) {
	const BUFFER = 20;
	const query = sql`
    SELECT MIN(ST_M(pt)) as matchtime, contained.id, contained.name FROM 
    (
      SELECT (dp).geom as pt, summitlines.id, summitlines.name, summitlines.location FROM 
      (
        SELECT 
          ST_DumpPoints((SELECT linestring FROM strava_activity WHERE id = ${activityId})) as dp,
          summit.location,
          summit.id,
          summit.name
          from summit where ST_DWithin(
            ST_Transform((SELECT linestring FROM strava_activity WHERE id = ${activityId}),4326),
            summit.location,
            ${BUFFER}
          )
      ) as summitlines
      WHERE ST_Contains(ST_Buffer(summitlines.location,${BUFFER})::geometry, (dp).geom)
    ) as contained group by contained.id, contained.name
  `;

	const results = await db.execute<{ id: number; name: string; matchtime: number }>(query);
	return [...results];
}

export async function summitAttemptsFromActivity(line: string) {
	const summits = await summitsMatchPolyline(line);
	return summits;
}
