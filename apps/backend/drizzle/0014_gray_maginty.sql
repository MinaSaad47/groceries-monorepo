ALTER TABLE "items_trans" DROP CONSTRAINT "items_trans_itemId_items_id_fk";
--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "offer_price" SET DEFAULT 0;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items_trans" ADD CONSTRAINT "items_trans_itemId_items_id_fk" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
