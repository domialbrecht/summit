-- Multi-club support: club registry, user-club memberships, session active club, challenge scoping

CREATE TABLE "club" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "club_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"strava_club_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"profile_image_url" text,
	"created_by" text REFERENCES "user"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "club_slug_unique" UNIQUE("slug"),
	CONSTRAINT "club_strava_club_id_unique" UNIQUE("strava_club_id")
);
--> statement-breakpoint
CREATE TABLE "user_club" (
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
	"club_id" integer NOT NULL REFERENCES "club"("id") ON DELETE CASCADE,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_club_user_id_club_id_pk" PRIMARY KEY("user_id","club_id")
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_club_id" integer REFERENCES "club"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "challenge" ADD COLUMN "club_id" integer REFERENCES "club"("id") ON DELETE CASCADE;
--> statement-breakpoint

-- Seed SolyVC as the first club (idempotent)
INSERT INTO "club" ("slug", "strava_club_id", "name", "description")
VALUES ('solyvc', 1196981, 'SOLY VC', 'SOLY VC')
ON CONFLICT ("strava_club_id") DO NOTHING;
--> statement-breakpoint

-- Backfill all existing users as members of SolyVC (idempotent)
INSERT INTO "user_club" ("user_id", "club_id", "role", "joined_at")
SELECT u."id", c."id", CASE WHEN u."is_admin" THEN 'admin' ELSE 'member' END, now()
FROM "user" u, "club" c
WHERE c."slug" = 'solyvc'
ON CONFLICT ("user_id", "club_id") DO NOTHING;
--> statement-breakpoint

-- Assign challenges without a club to SolyVC
UPDATE "challenge" SET "club_id" = (SELECT "id" FROM "club" WHERE "slug" = 'solyvc') WHERE "club_id" IS NULL;
