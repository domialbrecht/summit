import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { submitActivityToChallenge } from '$lib/activities/challenge_match';
import type { Actions, PageServerLoad } from './$types';

const submitToChallengeSchema = z.object({
	challengeId: z.number().int().positive()
});

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();
	const activityId = event.params.activity;

	const [summits, joinedChallenges, existingAttempts, submitForm] = await Promise.all([
		db
			.select()
			.from(table.summit_attempt)
			.innerJoin(table.summit, eq(table.summit_attempt.summitId, table.summit.id))
			.innerJoin(table.activity, eq(table.summit_attempt.activityId, table.activity.id))
			.where(
				and(
					eq(table.summit_attempt.activityId, activityId),
					eq(table.summit_attempt.userId, user.id)
				)
			),

		db
			.select({
				id: table.challenge.id,
				name: table.challenge.name,
				slug: table.challenge.slug
			})
			.from(table.challengeParticipant)
			.innerJoin(table.challenge, eq(table.challengeParticipant.challengeId, table.challenge.id))
			.where(eq(table.challengeParticipant.userId, user.id)),

		db
			.select({
				challengeId: table.challengeAttempt.challengeId,
				completed: table.challengeAttempt.completed,
				submittedAt: table.challengeAttempt.submittedAt
			})
			.from(table.challengeAttempt)
			.where(
				and(
					eq(table.challengeAttempt.activityId, activityId),
					eq(table.challengeAttempt.userId, user.id)
				)
			),

		superValidate(zod4(submitToChallengeSchema))
	]);

	return {
		summits,
		joinedChallenges,
		existingAttempts,
		submitForm
	};
};

export const actions = {
	submitToChallenge: async ({ request, locals, params }) => {
		const user = locals.user;
		if (!user) return fail(401, {});
		const activityId = params.activity;
		const form = await superValidate(request, zod4(submitToChallengeSchema));

		if (!form.valid) {
			return fail(400, { submitForm: form });
		}

		try {
			const result = await submitActivityToChallenge(user.id, activityId, form.data.challengeId);

			const matchedNames = result.matchedPoints.map((p) => p.name ?? `Punkt ${p.id}`).join(', ');

			if (result.completed) {
				return message(form, `✓ Challange abgschlosse! Alli ${result.totalPoints} Punkte gfunde.`);
			} else {
				const missing = result.totalPoints - result.matchedPoints.length;
				return message(
					form,
					`${result.matchedPoints.length}/${result.totalPoints} Punkte gfunde${matchedNames ? ': ' + matchedNames : ''}. No ${missing} fehlt${missing !== 1 ? 'e' : ''}.`
				);
			}
		} catch (e) {
			return message(form, `Fehler: ${e instanceof Error ? e.message : 'Unbekannte Fehler'}`, {
				status: 500
			});
		}
	}
} satisfies Actions;
