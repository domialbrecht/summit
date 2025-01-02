ALTER TABLE "summit" ADD CONSTRAINT "summit_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "summit_profile" ADD CONSTRAINT "summit_profile_slug_unique" UNIQUE("slug");
