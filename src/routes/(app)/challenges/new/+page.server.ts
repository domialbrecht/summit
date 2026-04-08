import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { slugify } from '$lib/utils';
import { z } from 'zod/v4';
import type { Actions, PageServerLoad } from './$types';

const createChallengeSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	pointsJson: z.string().min(2),
	ordered: z.string().optional(),
	type: z.enum(['one_time', 'seasonal']).optional()
});

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();
	const form = await superValidate(zod4(createChallengeSchema));
	return { form, user };
};

async function uniqueSlug(base: string): Promise<string> {
	const slug = slugify(base);
	let candidate = slug;
	let i = 2;
	while (true) {
		const existing = await db
			.select({ id: table.challenge.id })
			.from(table.challenge)
			.where(eq(table.challenge.slug, candidate))
			.limit(1);
		if (existing.length === 0) return candidate;
		candidate = `${slug}-${i++}`;
	}
}

export const actions = {
	default: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const user = locals.user;
		if (!user) return fail(401, {});
		const form = await superValidate(request, zod4(createChallengeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let points: {
			lat: number;
			long: number;
			name?: string;
			description?: string;
			summitId?: number;
		}[];
		try {
			points = JSON.parse(form.data.pointsJson);
			if (!Array.isArray(points) || points.length === 0) {
				return message(form, 'Mindeschtens ein Punkt hinzüfüege.', { status: 400 });
			}
		} catch {
			return message(form, 'Ungültige Punkt-Daten.', { status: 400 });
		}

		const slug = await uniqueSlug(form.data.name);
		const challengeType = form.data.type ?? 'one_time';
		const isOrdered = challengeType === 'seasonal' ? false : form.data.ordered === 'true';

		const [newChallenge] = await db
			.insert(table.challenge)
			.values({
				slug,
				name: form.data.name,
				description: form.data.description ?? null,
				type: challengeType,
				ordered: isOrdered,
				createdBy: user.id,
				createdAt: new Date()
			})
			.returning({ id: table.challenge.id, slug: table.challenge.slug });

		await db.insert(table.challengePoint).values(
			points.map((p, idx) => ({
				challengeId: newChallenge.id,
				summitId: p.summitId ?? null,
				sortOrder: idx,
				name: p.name ?? null,
				description: p.description ?? null,
				lat: String(p.lat),
				long: String(p.long),
				location: { x: p.long, y: p.lat }
			}))
		);

		redirect(303, `/challenges/${newChallenge.slug}`);
	}
} satisfies Actions;
