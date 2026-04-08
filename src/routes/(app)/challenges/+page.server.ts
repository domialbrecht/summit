import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { sql, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const challenges = await db
		.select({
			id: table.challenge.id,
			slug: table.challenge.slug,
			name: table.challenge.name,
			description: table.challenge.description,
			type: table.challenge.type,
			createdAt: table.challenge.createdAt,
			creatorFirstName: table.user.firstName,
			creatorLastName: table.user.lastName,
			participantCount: sql<number>`(
				SELECT COUNT(*) FROM challenge_participant cp WHERE cp.challenge_id = ${table.challenge.id}
			)`,
			pointCount: sql<number>`(
				SELECT COUNT(*) FROM challenge_point cpt WHERE cpt.challenge_id = ${table.challenge.id}
			)`,
			completionCount: sql<number>`(
				CASE WHEN ${table.challenge.type} = 'seasonal' THEN (
					SELECT COUNT(*) FROM challenge_attempt ca
					INNER JOIN season s ON s.id = ca.season_id
					WHERE ca.challenge_id = ${table.challenge.id} AND ca.completed = true AND s.is_active = true
				) ELSE (
					SELECT COUNT(*) FROM challenge_attempt ca WHERE ca.challenge_id = ${table.challenge.id} AND ca.completed = true
				) END
			)`
		})
		.from(table.challenge)
		.innerJoin(table.user, sql`${table.user.id} = ${table.challenge.createdBy}`)
		.orderBy(sql`${table.challenge.createdAt} DESC`);

	return { challenges };
};
