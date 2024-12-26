CREATE TABLE "strava_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"upload_id" text,
	"name" text,
	"distance" integer,
	"moving_time" numeric,
	"elapsed_time" numeric,
	"total_elevation_gain" numeric,
	"type" text,
	"start_date" timestamp with time zone NOT NULL,
	"average_speed" numeric,
	"max_speed" numeric,
	"average_watts" numeric,
	"summary_polyline" text NOT NULL,
	"polyline" text
);
--> statement-breakpoint
CREATE TABLE "parse_activity_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "parse_activity_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"activity_id" text NOT NULL,
	"has_match" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "summit" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lat" numeric NOT NULL,
	"long" numeric NOT NULL,
	"location" geography(point) NOT NULL,
	"elevation" integer,
	"category" smallint,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "summit_attempt" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "summit_attempt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"summit_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"published" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strava_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"strava_id" text NOT NULL,
	"profile" text,
	"ftp" numeric,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_strava_id_unique" UNIQUE("strava_id")
);
--> statement-breakpoint
ALTER TABLE "strava_activity" ADD CONSTRAINT "strava_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parse_activity_results" ADD CONSTRAINT "parse_activity_results_activity_id_strava_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."strava_activity"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summit_attempt" ADD CONSTRAINT "summit_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strava_tokens" ADD CONSTRAINT "strava_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_idx" ON "parse_activity_results" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "spatial_index" ON "summit" USING gist ("location");
