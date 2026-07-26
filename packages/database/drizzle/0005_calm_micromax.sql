CREATE TABLE "report_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"analysis_job_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"section" text NOT NULL,
	"content" jsonb NOT NULL,
	"source" text DEFAULT 'edit' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_versions_job_version_section_unique" UNIQUE("analysis_job_id","version","section")
);
--> statement-breakpoint
ALTER TABLE "report_versions" ADD CONSTRAINT "report_versions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_versions" ADD CONSTRAINT "report_versions_analysis_job_id_analysis_jobs_id_fk" FOREIGN KEY ("analysis_job_id") REFERENCES "public"."analysis_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "report_versions_org_job_idx" ON "report_versions" USING btree ("organization_id","analysis_job_id");--> statement-breakpoint
CREATE INDEX "sessions_user_expiry_idx" ON "sessions" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "agency_services_org_active_idx" ON "agency_services" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "case_studies_org_active_idx" ON "case_studies" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "ideal_customer_profiles_org_default_idx" ON "ideal_customer_profiles" USING btree ("organization_id","is_default");--> statement-breakpoint
CREATE INDEX "analysis_jobs_org_created_idx" ON "analysis_jobs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "analysis_jobs_org_status_idx" ON "analysis_jobs" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "source_pages_job_fetched_idx" ON "source_pages" USING btree ("analysis_job_id","fetched_at");--> statement-breakpoint
CREATE INDEX "technical_checks_job_status_idx" ON "technical_checks" USING btree ("analysis_job_id","status");--> statement-breakpoint
CREATE INDEX "report_findings_report_sort_idx" ON "report_findings" USING btree ("report_id","sort_order");--> statement-breakpoint
CREATE INDEX "reports_org_created_idx" ON "reports" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "reports_org_prospect_idx" ON "reports" USING btree ("organization_id","prospect_id");--> statement-breakpoint
CREATE INDEX "audit_logs_org_created_idx" ON "audit_logs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_action_created_idx" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "usage_events_org_created_idx" ON "usage_events" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "usage_events_event_created_idx" ON "usage_events" USING btree ("event_name","created_at");--> statement-breakpoint
ALTER TABLE "agency_profiles" ADD CONSTRAINT "agency_profiles_organization_unique" UNIQUE("organization_id");--> statement-breakpoint
ALTER TABLE "agency_services" ADD CONSTRAINT "agency_services_org_slug_unique" UNIQUE("organization_id","slug");