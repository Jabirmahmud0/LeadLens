# LeadLens PRD Gap List

**Re-audit date:** 2026-07-27

**PRD:** `LeadLens_Broad_PRD.md` v1.0
**Result:** No known code-level release blocker remains. The repository is buildable and suitable for a credentialed staging/private-alpha validation pass.

## Verification snapshot

| Check | Result |
|---|---|
| `pnpm typecheck` | Passed, including the web app and worker |
| `pnpm lint` | Passed with zero warnings |
| `pnpm test` | 40 tests passed across 9 files |
| `pnpm db:check` | Passed |
| `pnpm build` | Passed; 46 application routes generated |
| `git diff --check` | Passed after whitespace cleanup |

New migrations in this remediation series: `0004_motionless_rocket_racer.sql`, `0005_calm_micromax.sql`, and `0006_talented_smasher.sql`.

## Closed gaps

### Authentication and account security

- Verification uses the registered email instead of a hardcoded identity.
- App access requires `emailVerifiedAt`; unverified users are routed back to verification.
- Password-reset email links target the real `/reset-password` page.
- Registration account/org/member creation is transactional; SMTP failure no longer leaves the request in a false failure state.
- Password policy is consistently 12 characters for registration and reset.
- Registration no longer returns the explicit duplicate-email message.
- Logout is a real POST flow.
- Session IP values are hashed before storage.
- Password reset and email verification state changes are transactional and audited.
- Expired/used auth tokens and old rate-limit attempts are cleaned opportunistically.

### Routing and UI correctness

- All marketing `/signup` links now target `/register`.
- Analysis report links target the existing report root.
- Marketing URL intent is retained through registration and prefilled in the composer.
- All escaped template-literal defects were removed.
- Outreach reads the real `body` and `subjectLines` columns.
- PageSpeed processing cards read the persisted score shape.
- Remote Google-font build dependency was removed, so production builds are deterministic offline.

### Composer and prospect workflow

- Added contact role, email, profile URL, specific pages, language, analysis reason, competitors, case studies, tone, channels, and mobile/desktop PageSpeed choices.
- All selected agency asset IDs are organization-validated.
- Competitors are persisted.
- Duplicate detection links to the precise existing analysis and supports explicit rerun.
- Prospect history now has working search, status filter, sort, pagination, card/compact view, pin, archive, and restore controls.
- Analysis history now has working search, status filter, and pagination.

### Crawl, extraction, and restart safety

- One hardened fetch path enforces manual redirects, validation on every hop, MIME allowlists, streaming byte limits, and timeouts.
- Discovery checks declared sitemaps plus `/sitemap.xml`, ranks real site links before guesses, and honors requested pages.
- Crawl page count, per-fetch timeout, and overall duration are configurable.
- Every attempted/failed page is stored; duplicate-content pages are identified.
- Multi-page checks include failed pages, near duplicates, duplicate titles, and a bounded broken-link sample.
- Extracted HTML and response headers are durably available for technical/technology steps after worker restart.
- PageSpeed supports and persists mobile and desktop runs.
- Worker claim, heartbeat, stale recovery, cancellation, retry, and durable stage hydration remain implemented.

### Evidence, scoring, and report generation

- Stage 1 no longer permits best guesses and receives source-addressable text blocks.
- Verification covers findings, company facts, business classification, hypotheses, service matches, score factors, outreach, and proposal claims.
- Citation IDs must be from the supplied source allowlist.
- Citation excerpts are accepted only when they occur in stored source text; exact offsets are saved.
- Unsupported claims are included in report limitations, and complete verification output is versioned.
- Fit arithmetic is deterministic with the PRD weights and boundary-tested; model-provided arithmetic is ignored.
- Numeric confidence is normalized to Low/Medium/High labels.
- Report persistence is transactional.
- Call-prep budget, timeline, stakeholder, and warning-signal outputs are saved.
- Proposal risks and relevant case-study context are retained.
- Buying signals and required proof are displayed in opportunities.
- All requested outreach channels are persisted and displayed.

### Human control and report lifecycle

- Whole-report copy, Markdown export, print, delete, feedback, private notes, finding pin/hide/reorder, and source previews are implemented.
- Outreach and proposal content are editable.
- Section history is durable through `report_versions`.
- Whole/summary/outreach/proposal regeneration can be queued with preserved prior content.
- Restore-original is available, and edits/regenerations increment report versions.
- Partial processing identifies missing/skipped sections and allows retry; active jobs can be cancelled.

### Agency settings and data integrity

- Service and case-study saves preserve stable IDs instead of deleting referenced rows.
- Removed assets are deactivated rather than destructively recreated.
- Settings forms hydrate existing organization data before edits.
- Case-study visibility and service links are persisted correctly.
- Preferred website condition, proposal style, and CTA preference are retained.
- Tenant-scoped query helpers now cover jobs, reports, prospects, organizations, users, and sessions.
- Every report subsection independently filters by active organization in addition to the protected parent layout.
- Compound indexes were added for tenant/report/job/source/settings/event access paths.

### Security, privacy, analytics, and operations

- Next.js 16 `proxy.ts` replaces deprecated middleware.
- Unsafe API methods require a same-origin browser context, including auth APIs; internal worker routes retain service-token isolation.
- Production CSP no longer permits `unsafe-eval` and adds base/form/object/frame restrictions.
- Dynamic report email content and URLs are HTML/protocol sanitized.
- Account, verification, login, password, admin, prospect, edit, regeneration, restore, copy, export, submission, and completion signals are recorded in audit/usage data where applicable.
- PostHog captures route-change pageviews without autocapture.
- Admin diagnostics now include usage, feedback, security-event, token, latency, failure, user, and organization visibility; access attempts are audited.
- Mobile navigation has dialog semantics, Escape handling, focus trapping/restoration, labeled controls, and reduced-motion support.
- Marketing copy no longer uses fabricated testimonials or unsupported performance/revenue/retainer claims.
- `.env.example` contains placeholders only and documents crawl configuration.
- Render configuration includes the AI, PageSpeed, SMTP, app URL, and crawl variables actually used by the worker.
- pnpm is pinned consistently to 10.33.0 in the repository and CI.

## Remaining validation work (requires external environment)

These are not missing application wiring, but they must be completed before inviting real private-alpha users:

1. Apply migrations `0004`–`0006` to a staging Postgres database and run signup → verification → onboarding → analysis → report → edit/regenerate/export end to end.
2. Exercise Gemini primary, Groq fallback, PageSpeed mobile/desktop, SMTP completion/failure delivery, Render polling/heartbeat, and Vercel routing with real credentials.
3. Run worker kill/restart, stale-lock recovery, duplicate delivery, partial report, cancel/retry, database backup, and restore drills.
4. Run browser accessibility/keyboard/screen-reader and responsive visual regression against the deployed app.
5. Run redirect-to-private-host and DNS-rebinding tests from controlled infrastructure. The application revalidates each hop, but infrastructure-level rebinding behavior cannot be proven by local unit tests.
6. Evaluate 30–50 representative websites for evidence precision, unsupported-claim rate, report usefulness, latency, and provider cost.
7. Conduct the PRD pilot interviews/usage study with at least five agencies and measure repeat use, time saved, report usefulness, and willingness to pay.

## Further improvement scope (non-blocking)

- Replace CSP `unsafe-inline` with request nonces once the deployment platform and third-party scripts are tested under a nonce policy.
- Add a deployed Playwright/axe/visual-regression CI job after staging secrets and a seeded test database are available.
- Add provider-specific cost tables so admin token totals become exact currency estimates.
- Move the remaining direct non-report reads into tenant repository helpers for architectural consistency.
- Post-MVP PRD scope remains deferred: billing, teams/roles beyond owner/member, CRM integrations, enrichment, uploaded documents, public share links, white labeling, scheduled analysis, webhooks/API, and full proposal/CRM workflow.
