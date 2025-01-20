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
	index,
	primaryKey
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

export const activity = pgTable(
	'strava_activity',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		uploadId: text('upload_id'),
		name: text('name'),
		distance: integer('distance'),
		movingTime: numeric('moving_time'),
		elapsedTime: numeric('elapsed_time'),
		totalElevationGain: numeric('total_elevation_gain'),
		type: text('type'),
		startDate: timestamp('start_date', { withTimezone: true, mode: 'date' }).notNull(),
		averageSpeed: numeric('average_speed'),
		maxSpeed: numeric('max_speed'),
		averageWatts: numeric('average_watts'),
		summaryPolyline: text('summary_polyline').notNull(),
		linestring: text('linestring')
	},
	(t) => ({
		activitySptialIndex: index('activity_spatial_index').using('gist', t.linestring)
	})
);

export const activityMedia = pgTable('activity_media', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	url: text('url').notNull(),
	activityId: text('activity_id')
		.notNull()
		.references(() => activity.id, { onDelete: 'cascade' })
});

export const parseActivityResults = pgTable(
	'parse_activity_results',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		activityId: text('activity_id')
			.notNull()
			.references(() => activity.id, { onDelete: 'cascade' }),
		hasMatch: boolean('has_match').notNull()
	},
	(t) => {
		return {
			activityIdx: index('activity_idx').using('btree', t.activityId)
		};
	}
);

export const area = pgTable(
	'area',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: text('name').notNull().unique()
	},
	(t) => {
		return {
			nameIdx: index('name_idx').using('btree', t.name)
		};
	}
);

export const areaRelations = relations(area, ({ many }) => ({
	summitsToAreas: many(summitsToAreas)
}));

export const summit = pgTable(
	'summit',
	{
		id: integer().primaryKey().notNull(),
		slug: text('slug').notNull().unique(),
		name: text('name').notNull(),
		alias: text('alias'),
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
	summitAttempts: many(summit_attempt),
	summitProfiles: many(summit_profile),
	summitsToAreas: many(summitsToAreas)
}));

export const summitsToAreas = pgTable(
	'summits_to_areas',
	{
		summitId: integer('summit_id')
			.notNull()
			.references(() => summit.id),
		areaId: integer('area_id')
			.notNull()
			.references(() => area.id)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.summitId, t.areaId] })
	})
);

export const summitsToAreasRelations = relations(summitsToAreas, ({ one }) => ({
	area: one(area, {
		fields: [summitsToAreas.areaId],
		references: [area.id]
	}),
	summit: one(summit, {
		fields: [summitsToAreas.summitId],
		references: [summit.id]
	})
}));

export const summit_profile = pgTable(
	'summit_profile',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		summitId: integer('summit_id').notNull(),
		slug: text('slug').notNull().unique(),
		name: text('name').notNull(),
		linestring: geometry('linestringz', { type: undefined, srid: 4326 }).notNull(),
		data: text('data'),
		segment: text('segment'),
		description: text('description')
	},
	(t) => ({
		spatialProfileIndex: index('spatial_profile_index').using('gist', t.linestring)
	})
);

export const summitProfilesRelations = relations(summit_profile, ({ one }) => ({
	summit: one(summit, {
		fields: [summit_profile.summitId],
		references: [summit.id]
	})
}));

export const summit_attempt = pgTable('summit_attempt', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	summitId: integer('summit_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	activityId: text('activity_id')
		.references(() => activity.id, { onDelete: 'cascade' })
		.notNull(),
	date: timestamp('date', { withTimezone: true, mode: 'date' }).notNull(),
	published: boolean('published').notNull().default(false)
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

export type SelectArea = typeof area.$inferSelect;
export type SelectSummit = typeof summit.$inferSelect;
export type SelectSummitProfile = typeof summit_profile.$inferSelect;
export type SelectSummitAttempt = typeof summit_attempt.$inferSelect;
