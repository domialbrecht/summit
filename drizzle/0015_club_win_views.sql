CREATE VIEW "public"."win_activities_by_season_club" AS (
WITH earliestAttempts AS (
  SELECT
    sa.summit_id AS summit_id,
    sa.season_id AS season_id,
    uc.club_id AS club_id,
    MIN(sa.date) AS min_date
  FROM summit_attempt sa
  JOIN user_club uc ON uc.user_id = sa.user_id
  WHERE sa.published = TRUE
  GROUP BY sa.summit_id, sa.season_id, uc.club_id
)
SELECT DISTINCT ON (sa.user_id, sa.summit_id, sa.season_id, uc.club_id)
  sa.activity_id AS activity_id,
  sa.id AS attempt_id,
  sa.summit_id AS summit_id,
  sa.user_id AS user_id,
  sa.season_id AS season_id,
  uc.club_id AS club_id
FROM summit_attempt sa
JOIN user_club uc ON uc.user_id = sa.user_id
JOIN earliestAttempts ea
  ON sa.summit_id = ea.summit_id
 AND sa.season_id = ea.season_id
 AND uc.club_id = ea.club_id
WHERE
  sa.published = TRUE
  AND DATE(sa.date) = DATE(ea.min_date)
ORDER BY
  sa.user_id,
  sa.summit_id,
  sa.season_id,
  uc.club_id,
  sa.date
);--> statement-breakpoint
CREATE VIEW "public"."win_activities_club" AS (
SELECT
  was.activity_id,
  was.attempt_id,
  was.summit_id,
  was.user_id,
  was.club_id
FROM win_activities_by_season_club was
JOIN season s ON s.id = was.season_id
WHERE s.is_active = TRUE
);
