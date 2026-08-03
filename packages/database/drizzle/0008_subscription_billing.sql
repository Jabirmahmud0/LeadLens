CREATE TABLE "organization_billing_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"billing_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_billing_accounts_org_unique" UNIQUE("organization_id"),
	CONSTRAINT "organization_billing_accounts_customer_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "organization_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"plan_key" text NOT NULL,
	"status" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"trial_end" timestamp with time zone,
	"cancel_at" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"latest_stripe_event_created_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_subscriptions_org_unique" UNIQUE("organization_id"),
	CONSTRAINT "organization_subscriptions_stripe_subscription_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "organization_usage_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"plan_key" text NOT NULL,
	"analysis_limit" integer NOT NULL,
	"analyses_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_usage_periods_org_start_unique" UNIQUE("organization_id","period_start")
);
--> statement-breakpoint
CREATE TABLE "stripe_billing_events" (
	"stripe_event_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"stripe_object_id" text,
	"api_version" text,
	"livemode" boolean NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"event_created_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "organization_billing_accounts" ADD CONSTRAINT "organization_billing_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_usage_periods" ADD CONSTRAINT "organization_usage_periods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organization_subscriptions_customer_idx" ON "organization_subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "organization_subscriptions_status_idx" ON "organization_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "organization_usage_periods_org_end_idx" ON "organization_usage_periods" USING btree ("organization_id","period_end");--> statement-breakpoint
CREATE INDEX "stripe_billing_events_status_received_idx" ON "stripe_billing_events" USING btree ("status","received_at");