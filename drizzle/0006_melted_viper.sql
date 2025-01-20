ALTER TABLE "activity_media" DROP CONSTRAINT "activity_media_activity_id_strava_activity_id_fk";
--> statement-breakpoint
ALTER TABLE "parse_activity_results" DROP CONSTRAINT "parse_activity_results_activity_id_strava_activity_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_media" ADD CONSTRAINT "activity_media_activity_id_strava_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."strava_activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parse_activity_results" ADD CONSTRAINT "parse_activity_results_activity_id_strava_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."strava_activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summit_attempt" ADD CONSTRAINT "summit_attempt_activity_id_strava_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."strava_activity"("id") ON DELETE cascade ON UPDATE no action;
