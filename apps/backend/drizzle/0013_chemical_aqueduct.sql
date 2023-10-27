CREATE TABLE IF NOT EXISTS "items_trans" (
	"name" text NOT NULL,
	"description" text NOT NULL,
	"lang" varchar(5) NOT NULL,
	"itemId" uuid,
	CONSTRAINT items_trans_itemId_lang PRIMARY KEY("itemId","lang")
);
--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items_trans" ADD CONSTRAINT "items_trans_itemId_items_id_fk" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
