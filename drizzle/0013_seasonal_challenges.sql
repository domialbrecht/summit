ALTER TABLE "challenge" ADD COLUMN "type" text DEFAULT 'one_time' NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenge_attempt" ADD COLUMN "season_id" integer;
--> statement-breakpoint
ALTER TABLE "challenge_attempt" ADD CONSTRAINT "challenge_attempt_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE set null ON UPDATE no action;
