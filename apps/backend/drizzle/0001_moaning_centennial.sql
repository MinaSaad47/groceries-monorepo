CREATE TABLE IF NOT EXISTS "orders_to_items" (
	"order_id" uuid,
	"item_id" uuid,
	"quantity" numeric NOT NULL,
	"price_per_unit" numeric NOT NULL,
	CONSTRAINT orders_to_items_order_id_item_id PRIMARY KEY("order_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders_to_items" ADD CONSTRAINT "orders_to_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders_to_items" ADD CONSTRAINT "orders_to_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_item_id" PRIMARY KEY("user_id","item_id");