import type { Actions, PageServerLoad } from './$types';
import * as table from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	let summit = null;
	if (params.id) {
		const result = await db
			.select({
				id: table.summit.id,
				name: table.summit.name,
				slug: table.summit.slug,
				lat: table.summit.lat,
				long: table.summit.long,
				description: table.summit.description,
				elevation: table.summit.elevation,
				category: table.summit.category,
				alias: table.summit.alias
			})
			.from(table.summit)
			.where(eq(table.summit.id, parseInt(params.id)));
		summit = result.at(0);
	}

	if (params.id && !summit) {
		error(404, { message: 'Summit not found' });
	}

	return {
		form: await superValidate(summit, zod(table.summitInsertSchema))
	};
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(request, zod(table.summitInsertSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		if (!form.data.id) {
			const result = await db
				.select({ id: table.summit.id })
				.from(table.summit)
				.orderBy(desc(table.summit.id))
				.limit(1);
			const lastId = result.at(0)?.id || 0;

			await db.insert(table.summit).values({
				...form.data,
				id: lastId + 1,
				location: sql`ST_SetSRID(ST_MakePoint(${form.data.long}, ${form.data.lat})`
			});
			return message(form, 'Summit created');
		}

		if (form.data.id && !formData.has('delete')) {
			const result = await db
				.update(table.summit)
				.set({
					...form.data,
					location: sql`ST_SetSRID(ST_MakePoint(${form.data.long}, ${form.data.lat})`
				})
				.where(eq(table.summit.id, form.data.id));

			if (!result.at(0)) {
				error(400, { message: 'Summit not found' });
			}
			return message(form, 'Summit updated');
		}

		if (form.data.id && formData.has('delete')) {
			await db.delete(table.summit).where(eq(table.summit.id, form.data.id));
			redirect(303, '/admin/summits');
		}

		return { form };
	}
} satisfies Actions;
