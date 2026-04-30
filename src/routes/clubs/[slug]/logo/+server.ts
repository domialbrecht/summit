import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findClubBySlug } from '$lib/server/clubs';

export const GET: RequestHandler = async ({ params }) => {
	const club = await findClubBySlug(params.slug);
	if (!club || !club.profileImageUrl) {
		error(404, 'Logo not found');
	}

	const response = await fetch(club.profileImageUrl);
	if (!response.ok) {
		error(502, 'Failed to fetch logo');
	}

	return new Response(response.body, {
		headers: {
			'Content-Type': response.headers.get('Content-Type') ?? 'image/jpeg',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
