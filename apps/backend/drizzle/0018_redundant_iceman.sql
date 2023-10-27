ALTER TABLE "orders_to_items" DROP CONSTRAINT "orders_to_items_order_id_orders_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders_to_items" ADD CONSTRAINT "orders_to_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
