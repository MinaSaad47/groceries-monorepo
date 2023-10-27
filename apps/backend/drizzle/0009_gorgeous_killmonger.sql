ALTER TABLE "orders" RENAME COLUMN "total_amount" TO "total_price";--> statement-breakpoint
ALTER TABLE "orders_to_items" RENAME COLUMN "amount" TO "qty";