CREATE TABLE "challenge" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "challenge_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenge_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "challenge_point" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "challenge_point_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"challenge_id" integer NOT NULL,
	"name" text,
	"description" text,
	"lat" numeric NOT NULL,
	"long" numeric NOT NULL,
	"location" geometry(point, 4326) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_participant" (
	"challenge_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenge_participant_pkey" PRIMARY KEY("challenge_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "challenge_attempt" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "challenge_attempt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"challenge_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"activity_id" text NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_point_match" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "challenge_point_match_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"challenge_attempt_id" integer NOT NULL,
	"challenge_point_id" integer NOT NULL,
	"matched_at" numeric
);
--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "challenge_point" ADD CONSTRAINT "challenge_point_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "challenge_participant" ADD CONSTRAINT "challenge_participant_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "challenge_participant" ADD CONSTRAINT "challenge_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "challenge_attempt" ADD CONSTRAINT "challenge_attempt_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "challenge_attempt" ADD CONSTRAINT "challenge_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "challenge_attempt" ADD CONSTRAINT "challenge_attempt_activity_id_strava_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."strava_activity"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "challenge_point_match" ADD CONSTRAINT "challenge_point_match_challenge_attempt_id_challenge_attempt_id_fk" FOREIGN KEY ("challenge_attempt_id") REFERENCES "public"."challenge_attempt"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "challenge_point_match" ADD CONSTRAINT "challenge_point_match_challenge_point_id_challenge_point_id_fk" FOREIGN KEY ("challenge_point_id") REFERENCES "public"."challenge_point"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "challenge_point_spatial_index" ON "challenge_point" USING gist ("location");
--> statement-breakpoint
CREATE INDEX "challenge_point_challenge_idx" ON "challenge_point" USING btree ("challenge_id");
--> statement-breakpoint
CREATE INDEX "challenge_attempt_user_challenge_activity_idx" ON "challenge_attempt" USING btree ("user_id","challenge_id","activity_id");
