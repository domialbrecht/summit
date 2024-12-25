CREATE TABLE "parse_activity_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "parse_activity_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"activity_id" text NOT NULL,
	"has_match" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "summit" RENAME COLUMN "desc" TO "description";--> statement-breakpoint
ALTER TABLE "strava_activity" ALTER COLUMN "distance" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "summit_attempt" ADD COLUMN "date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "parse_activity_results" ADD CONSTRAINT "parse_activity_results_activity_id_strava_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."strava_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_idx" ON "parse_activity_results" USING btree ("activity_id");