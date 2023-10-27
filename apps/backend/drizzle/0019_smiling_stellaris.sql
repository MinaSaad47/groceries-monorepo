ALTER TYPE "order_status" ADD VALUE 'success';--> statement-breakpoint
ALTER TYPE "order_status" ADD VALUE 'failed';--> statement-breakpoint
ALTER TYPE "order_status" ADD VALUE 'expired';--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "order_date" TO "created_at";--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT "carts_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "expires_at" date DEFAULT CURRENT_TIMESTAMP + interval '1 minute';--> statement-breakpoint
ALTER TABLE "carts" DROP COLUMN IF EXISTS "order_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "paymeny_indent_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "total_price";