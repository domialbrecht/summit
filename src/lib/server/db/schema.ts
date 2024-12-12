import { pgTable, text, timestamp, numeric } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	stravaId: text('strava_id').notNull().unique(),
	profile: text('profile'),
	ftp: numeric('ftp')
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const tokens = pgTable('strava_tokens', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const activity = pgTable('strava_activity', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	uploadId: text('upload_id'),
	name: text('name'),
	distance: numeric('distance'),
	movingTime: numeric('moving_time'),
	elapsedTime: numeric('elapsed_time'),
	totalElevationGain: numeric('total_elevation_gain'),
	type: text('type'),
	startDate: timestamp('start_date', { withTimezone: true, mode: 'date-time' }).notNull(),
	averageSpeed: numeric('average_speed'),
	maxSpeed: numeric('max_speed'),
	averageWatts: numeric('average_watts')
});

export const map = pgTable('strava_map', {
	id: text('id').primaryKey(),
	polyline: text('polyline'),
	summaryPolyline: text('summary_polyline')
});

export const stream = pgTable('strava_activity_stream', {
	id: text('id').primaryKey(),
	activityId: text('activity_id')
		.notNull()
		.references(() => activity.id)
});

export type Session = typeof session.$inferSelect;
export type Tokens = typeof tokens.$inferSelect;
export type User = typeof user.$inferSelect;
export type Activity = typeof activity.$inferSelect;
export type Map = typeof map.$inferSelect;
export type Stream = typeof stream.$inferSelect;
