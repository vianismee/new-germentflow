ALTER TABLE "quality_inspections" ADD COLUMN "total_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quality_inspections" ADD COLUMN "passed_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quality_inspections" ADD COLUMN "repaired_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quality_inspections" ADD COLUMN "rejected_quantity" integer DEFAULT 0 NOT NULL;