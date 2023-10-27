ALTER TABLE "items" DROP CONSTRAINT "items_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "lat" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "lng" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
