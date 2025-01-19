import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { syncHookCallback } from '$lib/activities/activity_sync.js';
import logger from '$lib/logger.js';

type StravaWebhookEvent = {
	object_type: 'activity' | 'athlete';
	object_id: number;
	aspect_type: 'create' | 'update' | 'delete';
	owner_id: number;
	subscription_id: number;
};

export const GET: RequestHandler = ({ url }) => {
	const mode = url.searchParams.get('hub.mode');
	const token = url.searchParams.get('hub.verify_token');
	const challenge = url.searchParams.get('hub.challenge');
	logger.info({ message: 'webhook challenge received' });
	if (mode === 'subscribe' && token === env.STRAVA_WEBHOOK_SECRET) {
		logger.info({ message: 'webhook challenge confirmed' });
		return json({ 'hub.challenge': challenge });
	}
	return error(403);
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const event: StravaWebhookEvent = await request.json();
		logger.info({ message: 'webhook event received', data: event });
		if (
			(event.object_type === 'activity' && event.aspect_type === 'create') ||
			event.aspect_type === 'update'
		) {
			syncHookCallback(event.object_id, event.owner_id, event.aspect_type === 'update');
		}
	} catch (error) {
		logger.error({ message: 'webhook event error', data: error });
	}
	// Return 200 OK to acknowledge receipt of the event
	return new Response('OK', { status: 200 });
};
