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
	if (mode === 'subscribe' && token === env.STRAVA_WEBHOOK_SECRET) {
		json({ 'hub.challenge': challenge });
	}
	return error(403);
};

export const POST: RequestHandler = async ({ request }) => {
	logger.info('webhook event received', request.url, request.body);
	const event = request.body as unknown as StravaWebhookEvent;
	if (event.object_type === 'activity' && event.aspect_type === 'create') {
		syncHookCallback(event.object_id, event.owner_id);
	}
	// Return 200 OK to acknowledge receipt of the event
	return new Response('OK', { status: 200 });
};
