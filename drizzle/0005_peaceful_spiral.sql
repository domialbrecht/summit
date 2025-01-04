CREATE TABLE "activity_media" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "activity_media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"url" text NOT NULL,
	"activity_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_media" ADD CONSTRAINT "activity_media_activity_id_strava_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."strava_activity"("id") ON DELETE no action ON UPDATE no action;
