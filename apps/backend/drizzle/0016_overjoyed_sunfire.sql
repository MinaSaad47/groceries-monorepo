CREATE TABLE IF NOT EXISTS "categories_trans" (
	"name" text NOT NULL,
	"lang" varchar(5) NOT NULL,
	"category_id" uuid,
	CONSTRAINT categories_trans_category_id_lang PRIMARY KEY("category_id","lang")
);
--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories_trans" ADD CONSTRAINT "categories_trans_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
