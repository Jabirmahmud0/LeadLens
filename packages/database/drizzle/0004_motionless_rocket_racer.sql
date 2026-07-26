ALTER TABLE "agency_profiles" ADD COLUMN "proposal_style" text;--> statement-breakpoint
ALTER TABLE "agency_profiles" ADD COLUMN "cta_preference" text;--> statement-breakpoint
ALTER TABLE "ideal_customer_profiles" ADD COLUMN "preferred_website_conditions" jsonb;