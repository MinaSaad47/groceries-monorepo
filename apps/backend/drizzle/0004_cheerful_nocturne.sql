ALTER TABLE "orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP + interval '30 minute';--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "expires_at";