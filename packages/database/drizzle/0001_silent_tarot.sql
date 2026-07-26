ALTER TABLE "users" ADD COLUMN "report_completion_emails" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "product_update_emails" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pagespeed_results" ADD CONSTRAINT "pagespeed_results_job_strategy_unique" UNIQUE("analysis_job_id","strategy");--> statement-breakpoint
ALTER TABLE "source_pages" ADD CONSTRAINT "source_pages_job_url_unique" UNIQUE("analysis_job_id","url");--> statement-breakpoint
ALTER TABLE "technical_checks" ADD CONSTRAINT "technical_checks_job_check_unique" UNIQUE("analysis_job_id","check_key");--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_analysis_job_id_unique" UNIQUE("analysis_job_id");