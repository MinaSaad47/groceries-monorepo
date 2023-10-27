ALTER TABLE "carts" DROP CONSTRAINT "carts_user_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carts" ADD CONSTRAINT "carts_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "carts" DROP COLUMN IF EXISTS "user_id";