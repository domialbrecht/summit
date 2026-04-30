import { relations, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
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
	primaryKey,
	pgView
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

export const club = pgTable('club', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	slug: text('slug').notNull().unique(),
	stravaClubId: integer('strava_club_id').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	profileImageUrl: text('profile_image_url'),
	primaryColor: text('primary_color'),
	createdBy: text('created_by').references(() => user.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const userClub = pgTable(
	'user_club',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		clubId: integer('club_id')
			.notNull()
			.references(() => club.id, { onDelete: 'cascade' }),
		role: text('role').notNull().default('member'),
		joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.clubId] })
	})
);

export const clubRelations = relations(club, ({ many, one }) => ({
	members: many(userClub),
	creator: one(user, { fields: [club.createdBy], references: [user.id] }),
	challenges: many(challenge)
}));

export const userClubRelations = relations(userClub, ({ one }) => ({
	user: one(user, { fields: [userClub.userId], references: [user.id] }),
	club: one(club, { fields: [userClub.clubId], references: [club.id] })
}));

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	activeClubId: integer('active_club_id').references(() => club.id, { onDelete: 'set null' })
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

export const summit_attempt = pgTable(
	'summit_attempt',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		summitId: integer('summit_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		activityId: text('activity_id')
			.references(() => activity.id, { onDelete: 'cascade' })
			.notNull(),
		date: timestamp('date', { withTimezone: true, mode: 'date' }).notNull(),
		published: boolean('published').notNull().default(false),
		seasonId: integer('season_id')
			.notNull()
			.references(() => season.id)
	},

	(t) => ({
		saPubSeasonSummitDateIdx: index('sa_pub_season_summit_date_idx')
			.using('btree', t.seasonId, t.summitId, t.date)
			.where(sql`${t.published} = true`),

		saPubSeasonUserSummitDateIdx: index('sa_pub_season_user_summit_date_idx')
			.using('btree', t.seasonId, t.userId, t.summitId, t.date)
			.where(sql`${t.published} = true`)
	})
);

export const summitAttemptsRelations = relations(summit_attempt, ({ one }) => ({
	summit: one(summit, {
		fields: [summit_attempt.summitId],
		references: [summit.id]
	})
}));

export const winActivitiesBySeasonView = pgView('win_activities_by_season', {
	activityId: text('activity_id')
		.notNull()
		.references(() => activity.id),
	attemptId: integer('attempt_id')
		.notNull()
		.references(() => summit_attempt.id),
	summitId: integer('summit_id')
		.notNull()
		.references(() => summit.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	seasonId: integer('season_id')
		.notNull()
		.references(() => season.id)
}).as(sql`
WITH earliestAttempts AS (
  SELECT
    ${summit_attempt.summitId} AS summit_id,
    ${summit_attempt.seasonId} AS season_id,
    MIN(${summit_attempt.date}) AS min_date
  FROM ${summit_attempt}
  WHERE ${summit_attempt.published} = TRUE
  GROUP BY ${summit_attempt.summitId}, ${summit_attempt.seasonId}
)
SELECT DISTINCT ON (${summit_attempt.userId}, ${summit_attempt.summitId}, ${summit_attempt.seasonId})
  ${summit_attempt.activityId} AS activity_id,
  ${summit_attempt.id} AS attempt_id,
  ${summit_attempt.summitId} AS summit_id,
  ${summit_attempt.userId} AS user_id,
  ${summit_attempt.seasonId} AS season_id
FROM ${summit_attempt}
JOIN earliestAttempts ea
  ON ${summit_attempt.summitId} = ea.summit_id
 AND ${summit_attempt.seasonId} = ea.season_id
WHERE
  ${summit_attempt.published} = TRUE
  AND DATE(${summit_attempt.date}) = DATE(ea.min_date)
ORDER BY
  ${summit_attempt.userId},
  ${summit_attempt.summitId},
  ${summit_attempt.seasonId},
  ${summit_attempt.date}
`);

export const winActivitiesView = pgView('win_activities', {
	activityId: text('activity_id')
		.notNull()
		.references(() => activity.id),
	attemptId: integer('attempt_id')
		.notNull()
		.references(() => summit_attempt.id),
	summitId: integer('summit_id')
		.notNull()
		.references(() => summit.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id)
}).as(sql`
SELECT
  was.activity_id,
  was.attempt_id,
  was.summit_id,
  was.user_id
FROM win_activities_by_season was
JOIN season s ON s.id = was.season_id
WHERE s.is_active = TRUE
`);

export const winActivitiesBySeasonClubView = pgView('win_activities_by_season_club', {
	activityId: text('activity_id')
		.notNull()
		.references(() => activity.id),
	attemptId: integer('attempt_id')
		.notNull()
		.references(() => summit_attempt.id),
	summitId: integer('summit_id')
		.notNull()
		.references(() => summit.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	seasonId: integer('season_id')
		.notNull()
		.references(() => season.id),
	clubId: integer('club_id')
		.notNull()
		.references(() => club.id)
}).as(sql`
WITH earliestAttempts AS (
  SELECT
    ${summit_attempt.summitId} AS summit_id,
    ${summit_attempt.seasonId} AS season_id,
    ${userClub.clubId} AS club_id,
    MIN(${summit_attempt.date}) AS min_date
  FROM ${summit_attempt}
  JOIN ${userClub} ON ${userClub.userId} = ${summit_attempt.userId}
  WHERE ${summit_attempt.published} = TRUE
  GROUP BY ${summit_attempt.summitId}, ${summit_attempt.seasonId}, ${userClub.clubId}
)
SELECT DISTINCT ON (${summit_attempt.userId}, ${summit_attempt.summitId}, ${summit_attempt.seasonId}, ${userClub.clubId})
  ${summit_attempt.activityId} AS activity_id,
  ${summit_attempt.id} AS attempt_id,
  ${summit_attempt.summitId} AS summit_id,
  ${summit_attempt.userId} AS user_id,
  ${summit_attempt.seasonId} AS season_id,
  ${userClub.clubId} AS club_id
FROM ${summit_attempt}
JOIN ${userClub} ON ${userClub.userId} = ${summit_attempt.userId}
JOIN earliestAttempts ea
  ON ${summit_attempt.summitId} = ea.summit_id
 AND ${summit_attempt.seasonId} = ea.season_id
 AND ${userClub.clubId} = ea.club_id
WHERE
  ${summit_attempt.published} = TRUE
  AND DATE(${summit_attempt.date}) = DATE(ea.min_date)
ORDER BY
  ${summit_attempt.userId},
  ${summit_attempt.summitId},
  ${summit_attempt.seasonId},
  ${userClub.clubId},
  ${summit_attempt.date}
`);

export const winActivitiesClubView = pgView('win_activities_club', {
	activityId: text('activity_id')
		.notNull()
		.references(() => activity.id),
	attemptId: integer('attempt_id')
		.notNull()
		.references(() => summit_attempt.id),
	summitId: integer('summit_id')
		.notNull()
		.references(() => summit.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	clubId: integer('club_id')
		.notNull()
		.references(() => club.id)
}).as(sql`
SELECT
  was.activity_id,
  was.attempt_id,
  was.summit_id,
  was.user_id,
  was.club_id
FROM win_activities_by_season_club was
JOIN season s ON s.id = was.season_id
WHERE s.is_active = TRUE
`);

export const season = pgTable(
	'season',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		slug: text('slug').notNull().unique(),
		name: text('name').notNull(),
		startsAt: timestamp('starts_at', { withTimezone: true, mode: 'date' }).notNull(),
		endsAt: timestamp('ends_at', { withTimezone: true, mode: 'date' }).notNull(),
		isActive: boolean('is_active').notNull().default(false)
	},
	(t) => ({
		activeIdx: index('season_active_idx').using('btree', t.isActive),
		rangeIdx: index('season_range_idx').using('btree', t.startsAt, t.endsAt)
	})
);

export const challenge = pgTable('challenge', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	type: text('type').notNull().default('one_time'),
	ordered: boolean('ordered').notNull().default(false),
	clubId: integer('club_id').references(() => club.id, { onDelete: 'cascade' }),
	createdBy: text('created_by')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const challengeRelations = relations(challenge, ({ one, many }) => ({
	creator: one(user, { fields: [challenge.createdBy], references: [user.id] }),
	club: one(club, { fields: [challenge.clubId], references: [club.id] }),
	points: many(challengePoint),
	participants: many(challengeParticipant),
	attempts: many(challengeAttempt)
}));

export const challengePoint = pgTable(
	'challenge_point',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		challengeId: integer('challenge_id')
			.notNull()
			.references(() => challenge.id, { onDelete: 'cascade' }),
		summitId: integer('summit_id').references(() => summit.id, { onDelete: 'set null' }),
		sortOrder: integer('sort_order').notNull().default(0),
		name: text('name'),
		description: text('description'),
		lat: numeric('lat').notNull(),
		long: numeric('long').notNull(),
		location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull()
	},
	(t) => ({
		challengePointSpatialIndex: index('challenge_point_spatial_index').using('gist', t.location),
		challengePointChallengeIdx: index('challenge_point_challenge_idx').using('btree', t.challengeId)
	})
);

export const challengePointRelations = relations(challengePoint, ({ one }) => ({
	challenge: one(challenge, { fields: [challengePoint.challengeId], references: [challenge.id] }),
	summit: one(summit, { fields: [challengePoint.summitId], references: [summit.id] })
}));

export const challengeParticipant = pgTable(
	'challenge_participant',
	{
		challengeId: integer('challenge_id')
			.notNull()
			.references(() => challenge.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(t) => ({
		pk: primaryKey({ columns: [t.challengeId, t.userId] })
	})
);

export const challengeParticipantRelations = relations(challengeParticipant, ({ one }) => ({
	challenge: one(challenge, {
		fields: [challengeParticipant.challengeId],
		references: [challenge.id]
	}),
	user: one(user, { fields: [challengeParticipant.userId], references: [user.id] })
}));

export const challengeAttempt = pgTable(
	'challenge_attempt',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		challengeId: integer('challenge_id')
			.notNull()
			.references(() => challenge.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		activityId: text('activity_id')
			.notNull()
			.references(() => activity.id, { onDelete: 'cascade' }),
		seasonId: integer('season_id').references(() => season.id, { onDelete: 'set null' }),
		submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'date' })
			.notNull()
			.defaultNow(),
		completed: boolean('completed').notNull().default(false)
	},
	(t) => ({
		challengeAttemptUserChallengeActivityIdx: index(
			'challenge_attempt_user_challenge_activity_idx'
		).using('btree', t.userId, t.challengeId, t.activityId)
	})
);

export const challengeAttemptRelations = relations(challengeAttempt, ({ one, many }) => ({
	challenge: one(challenge, { fields: [challengeAttempt.challengeId], references: [challenge.id] }),
	user: one(user, { fields: [challengeAttempt.userId], references: [user.id] }),
	activity: one(activity, { fields: [challengeAttempt.activityId], references: [activity.id] }),
	pointMatches: many(challengePointMatch)
}));

export const challengePointMatch = pgTable('challenge_point_match', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	challengeAttemptId: integer('challenge_attempt_id')
		.notNull()
		.references(() => challengeAttempt.id, { onDelete: 'cascade' }),
	challengePointId: integer('challenge_point_id')
		.notNull()
		.references(() => challengePoint.id, { onDelete: 'cascade' }),
	matchedAt: numeric('matched_at')
});

export const challengePointMatchRelations = relations(challengePointMatch, ({ one }) => ({
	attempt: one(challengeAttempt, {
		fields: [challengePointMatch.challengeAttemptId],
		references: [challengeAttempt.id]
	}),
	point: one(challengePoint, {
		fields: [challengePointMatch.challengePointId],
		references: [challengePoint.id]
	})
}));

export type Session = typeof session.$inferSelect;
export type Tokens = typeof tokens.$inferSelect;
export type User = typeof user.$inferSelect;
export type Activity = typeof activity.$inferSelect;
export type ParsedActivity = typeof parseActivityResults.$inferSelect;
export type Club = typeof club.$inferSelect;
export type UserClub = typeof userClub.$inferSelect;

export type SelectArea = typeof area.$inferSelect;
export type SelectSummit = typeof summit.$inferSelect;
export type SelectSummitProfile = typeof summit_profile.$inferSelect;
export type SelectSummitAttempt = typeof summit_attempt.$inferSelect;
export type SelectChallenge = typeof challenge.$inferSelect;
export type SelectChallengePoint = typeof challengePoint.$inferSelect;

export const summitAttemptInsertSchema = createInsertSchema(summit_attempt);
export const insertChallengeSchema = createInsertSchema(challenge, {
	name: (s) => s.min(1).max(100),
	description: (s) => s.max(500).optional(),
	slug: (s) => s.optional()
});
export const insertChallengePointSchema = createInsertSchema(challengePoint, {
	name: (s) => s.max(100).optional(),
	description: (s) => s.max(300).optional()
});
