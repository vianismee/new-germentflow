DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('draft', 'on_review', 'approve', 'cancelled');--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING CASE
  WHEN "status" = 'draft' THEN 'draft'::"public"."order_status"
  WHEN "status" = 'processing' THEN 'on_review'::"public"."order_status"
  WHEN "status" = 'completed' THEN 'approve'::"public"."order_status"
  WHEN "status" = 'cancelled' THEN 'cancelled'::"public"."order_status"
  ELSE 'draft'::"public"."order_status"
END;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "total_orders";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "total_value";