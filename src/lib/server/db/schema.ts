import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, numeric, serial, boolean, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	stravaId: text('strava_id').notNull().unique(),
	profile: text('profile'),
	ftp: numeric('ftp'),
	isAdmin: boolean('is_admin').notNull().default(false)
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
	startDate: timestamp('start_date', { withTimezone: true, mode: 'date' }).notNull(),
	averageSpeed: numeric('average_speed'),
	maxSpeed: numeric('max_speed'),
	averageWatts: numeric('average_watts')
});

export const summit = pgTable('summit', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	lat: numeric('lat').notNull(),
	long: numeric('long').notNull(),
	desc: text('desc')
});

export const summutRelations = relations(summit, ({ many }) => ({
	summitAttempts: many(summit_attempt)
}));

export const summit_attempt = pgTable('summit_attempt', {
	id: serial('id').primaryKey(),
	summitId: integer('summit_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	activityId: text('activity_id')
		.notNull()
		.references(() => activity.id)
});

export const summitAttemptsRelations = relations(summit_attempt, ({ one }) => ({
	summit: one(summit, {
		fields: [summit_attempt.summitId],
		references: [summit.id]
	})
}));

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
