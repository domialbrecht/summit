import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { error, fail } from '@sveltejs/kit';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { z } from 'zod/v4';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const joinSchema = z.object({ action: z.enum(['join', 'leave']) });

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();
	const slug = event.params.slug;

	const [challengeRow] = await db
		.select()
		.from(table.challenge)
		.where(eq(table.challenge.slug, slug))
		.limit(1);

	if (!challengeRow) {
		error(404, { message: 'Challange nid gfunde' });
	}

	const [points, participants, completions, joinForm] = await Promise.all([
		db
			.select({
				id: table.challengePoint.id,
				name: table.challengePoint.name,
				description: table.challengePoint.description,
				lat: table.challengePoint.lat,
				long: table.challengePoint.long,
				sortOrder: table.challengePoint.sortOrder,
				summitId: table.challengePoint.summitId,
				summitName: table.summit.name,
				summitElevation: table.summit.elevation
			})
			.from(table.challengePoint)
			.leftJoin(table.summit, eq(table.challengePoint.summitId, table.summit.id))
			.where(eq(table.challengePoint.challengeId, challengeRow.id))
			.orderBy(table.challengePoint.sortOrder),

		db
			.select({
				userId: table.challengeParticipant.userId,
				joinedAt: table.challengeParticipant.joinedAt,
				firstName: table.user.firstName,
				lastName: table.user.lastName,
				profile: table.user.profile
			})
			.from(table.challengeParticipant)
			.innerJoin(table.user, eq(table.challengeParticipant.userId, table.user.id))
			.where(eq(table.challengeParticipant.challengeId, challengeRow.id)),

		// For seasonal challenges, scope completions to active season
		challengeRow.type === 'seasonal'
			? db
					.select({
						userId: table.challengeAttempt.userId,
						activityId: table.challengeAttempt.activityId,
						submittedAt: table.challengeAttempt.submittedAt,
						firstName: table.user.firstName,
						lastName: table.user.lastName
					})
					.from(table.challengeAttempt)
					.innerJoin(table.user, eq(table.challengeAttempt.userId, table.user.id))
					.innerJoin(table.season, eq(table.challengeAttempt.seasonId, table.season.id))
					.where(
						and(
							eq(table.challengeAttempt.challengeId, challengeRow.id),
							eq(table.challengeAttempt.completed, true),
							eq(table.season.isActive, true)
						)
					)
					.orderBy(sql`${table.challengeAttempt.submittedAt} ASC`)
			: db
					.select({
						userId: table.challengeAttempt.userId,
						activityId: table.challengeAttempt.activityId,
						submittedAt: table.challengeAttempt.submittedAt,
						firstName: table.user.firstName,
						lastName: table.user.lastName
					})
					.from(table.challengeAttempt)
					.innerJoin(table.user, eq(table.challengeAttempt.userId, table.user.id))
					.where(
						and(
							eq(table.challengeAttempt.challengeId, challengeRow.id),
							eq(table.challengeAttempt.completed, true)
						)
					)
					.orderBy(sql`${table.challengeAttempt.submittedAt} ASC`),

		superValidate(zod4(joinSchema))
	]);

	// For seasonal challenges, compute per-user progress in active season
	let seasonProgress: Record<string, number[]> = {};
	let activeSeason: { id: number; name: string } | null = null;

	if (challengeRow.type === 'seasonal') {
		const [seasonRow] = await db
			.select({ id: table.season.id, name: table.season.name })
			.from(table.season)
			.where(eq(table.season.isActive, true))
			.limit(1);

		if (seasonRow) {
			activeSeason = seasonRow;

			// Get all point matches for all participants in this season
			const participantIds = participants.map((p) => p.userId);
			if (participantIds.length > 0) {
				const matches = await db
					.selectDistinctOn(
						[table.challengeAttempt.userId, table.challengePointMatch.challengePointId],
						{
							userId: table.challengeAttempt.userId,
							pointId: table.challengePointMatch.challengePointId
						}
					)
					.from(table.challengePointMatch)
					.innerJoin(
						table.challengeAttempt,
						eq(table.challengePointMatch.challengeAttemptId, table.challengeAttempt.id)
					)
					.where(
						and(
							eq(table.challengeAttempt.challengeId, challengeRow.id),
							eq(table.challengeAttempt.seasonId, seasonRow.id),
							inArray(table.challengeAttempt.userId, participantIds)
						)
					);

				for (const m of matches) {
					if (!seasonProgress[m.userId]) seasonProgress[m.userId] = [];
					seasonProgress[m.userId].push(m.pointId);
				}
			}
		}
	}

	const isParticipant = participants.some((p) => p.userId === user.id);
	const isCreator = challengeRow.createdBy === user.id;

	return {
		challenge: challengeRow,
		userId: user.id,
		points,
		participants,
		completions,
		isParticipant,
		isCreator,
		joinForm,
		seasonProgress,
		activeSeason
	};
};

export const actions = {
	join: async ({ locals, params }: { locals: App.Locals; params: { slug: string } }) => {
		const user = locals.user;
		if (!user) return fail(401, {});
		const slug = params.slug;
		const form = await superValidate({ action: 'join' }, zod4(joinSchema));

		const [challengeRow] = await db
			.select({ id: table.challenge.id })
			.from(table.challenge)
			.where(eq(table.challenge.slug, slug))
			.limit(1);

		if (!challengeRow) return fail(404, { joinForm: form });

		await db
			.insert(table.challengeParticipant)
			.values({ challengeId: challengeRow.id, userId: user.id, joinedAt: new Date() })
			.onConflictDoNothing();

		return message(form, 'Beitritte erfolgrich');
	},

	leave: async ({ locals, params }: { locals: App.Locals; params: { slug: string } }) => {
		const user = locals.user;
		if (!user) return fail(401, {});
		const slug = params.slug;
		const form = await superValidate({ action: 'leave' }, zod4(joinSchema));

		const [challengeRow] = await db
			.select({ id: table.challenge.id })
			.from(table.challenge)
			.where(eq(table.challenge.slug, slug))
			.limit(1);

		if (!challengeRow) return fail(404, { joinForm: form });

		await db
			.delete(table.challengeParticipant)
			.where(
				and(
					eq(table.challengeParticipant.challengeId, challengeRow.id),
					eq(table.challengeParticipant.userId, user.id)
				)
			);

		return message(form, 'Challange verlah');
	},

	delete: async ({ locals, params }: { locals: App.Locals; params: { slug: string } }) => {
		const user = locals.user;
		if (!user) return fail(401, {});
		const slug = params.slug;

		const [challengeRow] = await db
			.select({ id: table.challenge.id, createdBy: table.challenge.createdBy })
			.from(table.challenge)
			.where(eq(table.challenge.slug, slug))
			.limit(1);

		if (!challengeRow) return fail(404, {});
		if (challengeRow.createdBy !== user.id) return fail(403, {});

		await db.delete(table.challenge).where(eq(table.challenge.id, challengeRow.id));

		redirect(303, '/challenges');
	}
} satisfies Actions;
