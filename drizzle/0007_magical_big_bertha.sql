CREATE VIEW "public"."win_activities" AS (
WITH earliestAttempts AS (
    SELECT 
        "summit_attempt"."summit_id" AS summit_id,
        MIN("summit_attempt"."date") AS min_date
    FROM "summit_attempt"
    WHERE "summit_attempt"."published" = TRUE
    GROUP BY "summit_attempt"."summit_id"
)
SELECT DISTINCT ON ("user"."id", "summit_attempt"."summit_id")
    "summit_attempt"."activity_id" AS activity_id,
    "summit_attempt"."summit_id" AS summit_id,
    "user"."id" AS user_id
FROM "summit_attempt"
LEFT JOIN "user" ON "user"."id" = "summit_attempt"."user_id"
INNER JOIN earliestAttempts ON "summit_attempt"."summit_id" = earliestAttempts.summit_id
WHERE 
    "summit_attempt"."published" = TRUE
    AND "summit_attempt"."date" >= (SELECT min_date FROM earliestAttempts WHERE earliestAttempts.summit_id = "summit_attempt"."summit_id")
    AND "summit_attempt"."date" < (SELECT min_date FROM earliestAttempts WHERE earliestAttempts.summit_id = "summit_attempt"."summit_id") + INTERVAL '1 minute'
);
