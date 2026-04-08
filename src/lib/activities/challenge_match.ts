import logger from '$lib/logger';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import polyline from '@mapbox/polyline';
import { sql, eq, and } from 'drizzle-orm';

const THRESHOLD_METERS = 50;
const BUFFER_METERS = 20;

const toWKT = (decoded: [number, number][]) => {
	const wkt = decoded.map((coord) => `${coord[1]} ${coord[0]}`).join(', ');
	return `LINESTRING(${wkt})`;
};

async function challengePointsMatchPolyline(line: string, challengeId: number) {
	const p = polyline.decode(line);
	const wkt = toWKT(p);
	const sqlLine = sql`ST_GeographyFromText(${wkt})`;
	const points = await db
		.select({ id: table.challengePoint.id })
		.from(table.challengePoint)
		.where(
			and(
				eq(table.challengePoint.challengeId, challengeId),
				sql`ST_DWithin(${table.challengePoint.location}, ${sqlLine}, ${THRESHOLD_METERS})`
			)
		);
	return points;
}

async function challengePointDetailMatch(
	activityId: string,
	challengeId: number
): Promise<{ id: number; matchtime: number }[]> {
	try {
		const query = sql`
      SELECT MIN(ST_M(pt)) as matchtime, contained.id FROM
      (
        SELECT (dp).geom as pt, cp.id FROM
        (
          SELECT
            ST_DumpPoints((SELECT linestring FROM strava_activity WHERE id = ${activityId})) as dp,
            cp.location,
            cp.id
          FROM challenge_point cp
          WHERE cp.challenge_id = ${challengeId}
            AND ST_DWithin(
              ST_Transform((SELECT linestring FROM strava_activity WHERE id = ${activityId}), 4326),
              cp.location,
              ${BUFFER_METERS}
            )
        ) as cplines
        WHERE ST_Contains(ST_Buffer(cplines.location, ${BUFFER_METERS})::geometry, (dp).geom)
      ) as contained
      GROUP BY contained.id
    `;

		const results = await db.execute<{ id: number; matchtime: number }>(query);
		logger.info({
			message: 'Matched challenge point details',
			data: { activity: activityId, challengeId, results }
		});
		return [...results];
	} catch (e) {
		logger.error({
			message: 'Failed to match challenge point details',
			data: { activity: activityId, challengeId, error: e }
		});
		return [];
	}
}

export async function submitActivityToChallenge(
	userId: string,
	activityId: string,
	challengeId: number
): Promise<{
	completed: boolean;
	matchedPoints: { id: number; name: string | null }[];
	totalPoints: number;
	seasonProgress?: { matchedPointIds: number[]; totalPoints: number; completed: boolean };
}> {
	const [activityRow] = await db
		.select({ summaryPolyline: table.activity.summaryPolyline })
		.from(table.activity)
		.where(and(eq(table.activity.id, activityId), eq(table.activity.userId, userId)))
		.limit(1);

	if (!activityRow) {
		throw new Error('Activity not found or does not belong to user');
	}

	// Load challenge metadata
	const [challengeRow] = await db
		.select({ ordered: table.challenge.ordered, type: table.challenge.type })
		.from(table.challenge)
		.where(eq(table.challenge.id, challengeId))
		.limit(1);

	if (!challengeRow) {
		throw new Error('Challenge not found');
	}

	// Load all points in sort order
	const allPoints = await db
		.select({
			id: table.challengePoint.id,
			name: table.challengePoint.name,
			sortOrder: table.challengePoint.sortOrder
		})
		.from(table.challengePoint)
		.where(eq(table.challengePoint.challengeId, challengeId))
		.orderBy(table.challengePoint.sortOrder);

	if (allPoints.length === 0) {
		throw new Error('Challenge has no points');
	}

	// Coarse match first
	const coarseMatches = await challengePointsMatchPolyline(
		activityRow.summaryPolyline,
		challengeId
	);

	let matchedPointIds: number[] = coarseMatches.map((p) => p.id);
	let matchedWithTime: { id: number; matchtime: number }[] = [];

	// Detail match if coarse found anything
	if (coarseMatches.length > 0) {
		matchedWithTime = await challengePointDetailMatch(activityId, challengeId);
		matchedPointIds = matchedWithTime.map((p) => p.id);
	}

	// If ordered, enforce sequential order via matchtime
	if (challengeRow.ordered && matchedWithTime.length > 0) {
		const expectedOrder = allPoints.map((p) => p.id); // already sorted by sortOrder
		const timeByPointId = new Map(matchedWithTime.map((m) => [m.id, m.matchtime]));

		const validIds: number[] = [];
		let lastTime = -Infinity;

		for (const pointId of expectedOrder) {
			const time = timeByPointId.get(pointId);
			if (time !== undefined && time > lastTime) {
				validIds.push(pointId);
				lastTime = time;
			} else {
				// Once a point is missed or out of order, stop counting
				break;
			}
		}

		matchedPointIds = validIds;
		matchedWithTime = matchedWithTime.filter((m) => validIds.includes(m.id));
	}

	const completed = matchedPointIds.length === allPoints.length;
	const matchedPoints = allPoints.filter((p) => matchedPointIds.includes(p.id));

	// For seasonal challenges, fetch the active season
	let seasonId: number | null = null;
	if (challengeRow.type === 'seasonal') {
		const [activeSeason] = await db
			.select({ id: table.season.id })
			.from(table.season)
			.where(eq(table.season.isActive, true))
			.limit(1);
		if (activeSeason) {
			seasonId = activeSeason.id;
		}
	}

	// Delete existing attempt for this user+activity+challenge (overwrite)
	const existing = await db
		.select({ id: table.challengeAttempt.id })
		.from(table.challengeAttempt)
		.where(
			and(
				eq(table.challengeAttempt.userId, userId),
				eq(table.challengeAttempt.activityId, activityId),
				eq(table.challengeAttempt.challengeId, challengeId)
			)
		)
		.limit(1);

	if (existing.length > 0) {
		await db.delete(table.challengeAttempt).where(eq(table.challengeAttempt.id, existing[0].id));
	}

	const [newAttempt] = await db
		.insert(table.challengeAttempt)
		.values({
			challengeId,
			userId,
			activityId,
			seasonId,
			completed,
			submittedAt: new Date()
		})
		.returning({ id: table.challengeAttempt.id });

	if (matchedWithTime.length > 0) {
		await db.insert(table.challengePointMatch).values(
			matchedWithTime.map((m) => ({
				challengeAttemptId: newAttempt.id,
				challengePointId: m.id,
				matchedAt: String(m.matchtime)
			}))
		);
	} else if (coarseMatches.length > 0) {
		// No detailed track available — record coarse matches without timestamp
		await db.insert(table.challengePointMatch).values(
			coarseMatches.map((m) => ({
				challengeAttemptId: newAttempt.id,
				challengePointId: m.id,
				matchedAt: null
			}))
		);
	}

	logger.info({
		message: 'Challenge attempt recorded',
		data: { userId, activityId, challengeId, completed, matched: matchedPointIds.length }
	});

	// For seasonal challenges, compute cumulative progress across all attempts in this season
	if (challengeRow.type === 'seasonal' && seasonId !== null) {
		const seasonMatches = await db
			.selectDistinct({ pointId: table.challengePointMatch.challengePointId })
			.from(table.challengePointMatch)
			.innerJoin(
				table.challengeAttempt,
				eq(table.challengePointMatch.challengeAttemptId, table.challengeAttempt.id)
			)
			.where(
				and(
					eq(table.challengeAttempt.challengeId, challengeId),
					eq(table.challengeAttempt.userId, userId),
					eq(table.challengeAttempt.seasonId, seasonId)
				)
			);

		const seasonMatchedIds = seasonMatches.map((m) => m.pointId);
		const seasonCompleted = seasonMatchedIds.length >= allPoints.length;

		// If newly completed via cumulative progress, mark the current attempt as completed
		if (seasonCompleted && !completed) {
			await db
				.update(table.challengeAttempt)
				.set({ completed: true })
				.where(eq(table.challengeAttempt.id, newAttempt.id));
		}

		return {
			completed,
			matchedPoints,
			totalPoints: allPoints.length,
			seasonProgress: {
				matchedPointIds: seasonMatchedIds,
				totalPoints: allPoints.length,
				completed: seasonCompleted
			}
		};
	}

	return { completed, matchedPoints, totalPoints: allPoints.length };
}
