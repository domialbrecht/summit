CREATE TABLE "season" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "season_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	CONSTRAINT "season_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint

-- 1) Add season_id as NULLABLE first (so existing rows don't break)
ALTER TABLE "summit_attempt" ADD COLUMN "season_id" integer;
--> statement-breakpoint

CREATE INDEX "season_active_idx" ON "season" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX "season_range_idx" ON "season" USING btree ("starts_at","ends_at");
--> statement-breakpoint

-- 2) Create seasons for each calendar year present in existing summit_attempt data
INSERT INTO "season" ("slug", "name", "starts_at", "ends_at", "is_active")
SELECT
	y::text AS "slug",
	'Season ' || y AS "name",
	make_timestamptz(y, 1, 1, 0, 0, 0, 'UTC') AS "starts_at",
	make_timestamptz(y + 1, 1, 1, 0, 0, 0, 'UTC') AS "ends_at",
	FALSE AS "is_active"
FROM (
	SELECT DISTINCT EXTRACT(YEAR FROM "date")::int AS y
	FROM "summit_attempt"
) years
ORDER BY y;
--> statement-breakpoint

-- 3) Mark newest year as active (adjust if you want a specific season active)
UPDATE "season"
SET "is_active" = TRUE
WHERE "slug" = (
	SELECT MAX(EXTRACT(YEAR FROM "date")::int)::text
	FROM "summit_attempt"
);
--> statement-breakpoint

-- 4) Backfill summit_attempt.season_id by matching the attempt date into the season range
UPDATE "summit_attempt" sa
SET "season_id" = s."id"
FROM "season" s
WHERE sa."date" >= s."starts_at"
  AND sa."date" <  s."ends_at"
  AND sa."season_id" IS NULL;
--> statement-breakpoint

-- 5) Enforce NOT NULL + FK AFTER backfill
ALTER TABLE "summit_attempt" ALTER COLUMN "season_id" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "summit_attempt"
ADD CONSTRAINT "summit_attempt_season_id_season_id_fk"
FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX "sa_pub_season_summit_date_idx" ON "summit_attempt" USING btree ("season_id","summit_id","date") WHERE "summit_attempt"."published" = true;--> statement-breakpoint
CREATE INDEX "sa_pub_season_user_summit_date_idx" ON "summit_attempt" USING btree ("season_id","user_id","summit_id","date") WHERE "summit_attempt"."published" = true;--> statement-breakpoint
--> statement-breakpoint

DROP VIEW "public"."win_activities";--> statement-breakpoint
CREATE VIEW "public"."win_activities_by_season" AS (
WITH earliestAttempts AS (
  SELECT
    "summit_attempt"."summit_id" AS summit_id,
    "summit_attempt"."season_id" AS season_id,
    MIN("summit_attempt"."date") AS min_date
  FROM "summit_attempt"
  WHERE "summit_attempt"."published" = TRUE
  GROUP BY "summit_attempt"."summit_id", "summit_attempt"."season_id"
)
SELECT DISTINCT ON ("summit_attempt"."user_id", "summit_attempt"."summit_id", "summit_attempt"."season_id")
  "summit_attempt"."activity_id" AS activity_id,
  "summit_attempt"."id" AS attempt_id,
  "summit_attempt"."summit_id" AS summit_id,
  "summit_attempt"."user_id" AS user_id,
  "summit_attempt"."season_id" AS season_id
FROM "summit_attempt"
JOIN earliestAttempts ea
  ON "summit_attempt"."summit_id" = ea.summit_id
 AND "summit_attempt"."season_id" = ea.season_id
WHERE
  "summit_attempt"."published" = TRUE
  AND DATE("summit_attempt"."date") = DATE(ea.min_date)
ORDER BY
  "summit_attempt"."user_id",
  "summit_attempt"."summit_id",
  "summit_attempt"."season_id",
  "summit_attempt"."date"
);--> statement-breakpoint
CREATE VIEW "public"."win_activities" AS (
SELECT
  was.activity_id,
  was.attempt_id,
  was.summit_id,
  was.user_id
FROM win_activities_by_season was
JOIN season s ON s.id = was.season_id
WHERE s.is_active = TRUE
);

