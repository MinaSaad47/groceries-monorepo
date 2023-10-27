CREATE TABLE IF NOT EXISTS "orders_to_items" (
	"order_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"amount" numeric NOT NULL,
	CONSTRAINT orders_to_items_order_id_item_id PRIMARY KEY("order_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_cart_id_unique";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_cart_id_carts_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "user_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "cart_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders_to_items" ADD CONSTRAINT "orders_to_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders_to_items" ADD CONSTRAINT "orders_to_items_item_id_orders_id_fk" FOREIGN KEY ("item_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
