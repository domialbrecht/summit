ALTER TABLE "summit_profile" RENAME COLUMN "linestring" TO "linestringz";--> statement-breakpoint
DROP INDEX "spatial_profile_index";--> statement-breakpoint
ALTER TABLE "summit_profile" ALTER COLUMN linestringz TYPE geography(LINESTRINGZ);
CREATE INDEX "spatial_profile_index" ON "summit_profile" USING gist ("linestringz");
