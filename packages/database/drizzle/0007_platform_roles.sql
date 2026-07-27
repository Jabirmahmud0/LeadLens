CREATE TABLE "platform_role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"granted_by" uuid,
	"grant_reason" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_by" uuid,
	"revoke_reason" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_role_assignments_user_role_unique" UNIQUE("user_id","role")
);
--> statement-breakpoint
ALTER TABLE "platform_role_assignments" ADD CONSTRAINT "platform_role_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_role_assignments" ADD CONSTRAINT "platform_role_assignments_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_role_assignments" ADD CONSTRAINT "platform_role_assignments_revoked_by_users_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platform_role_assignments_user_active_idx" ON "platform_role_assignments" USING btree ("user_id","revoked_at");--> statement-breakpoint
CREATE INDEX "platform_role_assignments_role_active_idx" ON "platform_role_assignments" USING btree ("role","revoked_at");--> statement-breakpoint
INSERT INTO "platform_role_assignments" (
	"user_id",
	"role",
	"granted_by",
	"grant_reason",
	"source"
)
SELECT
	"id",
	'platform_owner',
	"id",
	'Initial LeadLens platform owner',
	'migration_bootstrap'
FROM "users"
WHERE lower("email") = 'leadlens@saevix.dev'
ON CONFLICT ("user_id", "role") DO UPDATE SET
	"revoked_at" = NULL,
	"revoked_by" = NULL,
	"revoke_reason" = NULL,
	"updated_at" = now();--> statement-breakpoint
INSERT INTO "audit_logs" ("user_id", "action", "details")
SELECT
	"id",
	'platform_role_bootstrapped',
	jsonb_build_object('role', 'platform_owner', 'source', 'migration_bootstrap')
FROM "users"
WHERE lower("email") = 'leadlens@saevix.dev';
