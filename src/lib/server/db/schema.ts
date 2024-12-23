import { relations } from 'drizzle-orm';
import {
	pgTable,
	text,
	timestamp,
	numeric,
	boolean,
	integer,
	smallint,
	geometry,
	index
} from 'drizzle-orm/pg-core';

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
	averageWatts: numeric('average_watts'),
	summaryPolyline: text('summary_polyline').notNull(),
	polyline: text('polyline')
});

export const parseActivityResults = pgTable(
	'parse_activity_results',
	{
		id: text('id').primaryKey(),
		activityId: text('activity_id')
			.notNull()
			.references(() => activity.id),
		hasMatch: boolean('has_match').notNull()
	},
	(t) => {
		return {
			activityIdx: index('activity_idx').using('btree', t.activityId)
		};
	}
);

export const summit = pgTable(
	'summit',
	{
		id: integer().primaryKey().notNull(),
		name: text('name').notNull(),
		lat: numeric('lat').notNull(),
		long: numeric('long').notNull(),
		location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
		elevation: integer('elevation'),
		category: smallint('category'),
		description: text('description')
	},
	(t) => ({
		spatialIndex: index('spatial_index').using('gist', t.location)
	})
);

export const summitRelations = relations(summit, ({ many }) => ({
	summitAttempts: many(summit_attempt)
}));

export const summit_attempt = pgTable('summit_attempt', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	summitId: integer('summit_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	activityId: text('activity_id').notNull(),
	date: timestamp('date', { withTimezone: true, mode: 'date' }).notNull(),
	published: boolean('published').notNull().default(false)
	// .references(() => activity.id)
});

export const summitAttemptsRelations = relations(summit_attempt, ({ one }) => ({
	summit: one(summit, {
		fields: [summit_attempt.summitId],
		references: [summit.id]
	})
}));

export type Session = typeof session.$inferSelect;
export type Tokens = typeof tokens.$inferSelect;
export type User = typeof user.$inferSelect;
export type Activity = typeof activity.$inferSelect;
export type ParsedActivity = typeof parseActivityResults.$inferSelect;

export type SelectSummit = typeof summit.$inferSelect;
