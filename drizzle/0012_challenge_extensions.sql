ALTER TABLE "challenge" ADD COLUMN "ordered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_point" ADD COLUMN "summit_id" integer;--> statement-breakpoint
ALTER TABLE "challenge_point" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_point" ADD CONSTRAINT "challenge_point_summit_id_summit_id_fk" FOREIGN KEY ("summit_id") REFERENCES "public"."summit"("id") ON DELETE set null ON UPDATE no action;
