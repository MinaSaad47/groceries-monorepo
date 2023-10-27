ALTER TABLE "carts_to_items" RENAME COLUMN "quantity" TO "qty";--> statement-breakpoint
ALTER TABLE "items" RENAME COLUMN "quantity" TO "qty";--> statement-breakpoint
ALTER TABLE "items" RENAME COLUMN "quantity_type" TO "qty_type";