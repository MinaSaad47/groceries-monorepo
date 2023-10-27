ALTER TABLE "orders_to_items" DROP CONSTRAINT "orders_to_items_item_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "carts_to_items" ALTER COLUMN "qty" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "orders_to_items" ALTER COLUMN "qty" SET DATA TYPE integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders_to_items" ADD CONSTRAINT "orders_to_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
