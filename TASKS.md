# LeadLens — Implementation Task List

> Full PRD coverage, phase-by-phase. After completing each task or group of tasks, push to GitHub with a matching conventional commit.
>
> Commit format: `type(scope): description`  
> Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`  
> Example: `feat(auth): implement email verification with token hashing`

---

## Phase 0 — Repo & Project Bootstrap

> **Goal:** Empty repo → working monorepo skeleton with CI, linting, and database connection.

### 0.1 Monorepo scaffold
- [ ] Initialize `pnpm` workspaces (`apps/web`, `apps/worker`, `packages/*`)
- [ ] Create `packages/config` with shared `tsconfig.base.json`, `eslint.config.js`, `tailwind.config.base.js`
- [ ] Create `packages/shared` — types, constants, utility functions (URL normalization, domain helpers)
- [ ] Create `packages/ui` — bare shell, will hold shared React components
- [ ] Create `packages/database` — Drizzle ORM setup (see §17.3 & §18.3)
- [ ] Create `packages/auth` — auth services shell
- [ ] Create `packages/ai` — AI provider abstraction shell
- [ ] Create `packages/analysis` — crawl/technical-check shell
- [ ] Add root `package.json` with `dev`, `build`, `lint`, `typecheck` scripts

> 📌 **Commit:** `chore(repo): initialize pnpm monorepo with workspace packages`

---

### 0.2 Next.js app (`apps/web`)
- [ ] Bootstrap Next.js 14+ App Router with TypeScript
- [ ] Install Tailwind CSS, shadcn/ui init, Radix UI, Lucide icons, Framer Motion
- [ ] Install React Hook Form + Zod
- [ ] Set up `app/` directory structure mirroring the IA (§12):
  ```
  app/
  ├── (public)/           # marketing pages
  ├── (auth)/             # login, register, verify, reset
  ├── (app)/              # dashboard, reports, agency, settings
  └── api/                # route handlers
  ```
- [ ] Global CSS variables for the design system (light + dark tokens from §13.3)
- [ ] Inter/Geist font via `next/font`
- [ ] `layout.tsx` with dark-mode class support

> 📌 **Commit:** `feat(web): scaffold Next.js app with Tailwind, shadcn, and design tokens`

---

### 0.3 Worker app (`apps/worker`)
- [ ] Bootstrap Node.js TypeScript app (tsx/esbuild)
- [ ] `src/index.ts` — HTTP server listening for job claims (Express or Hono)
- [ ] Internal route stubs: `/internal/jobs/claim`, `/internal/jobs/:id/progress`, `/internal/jobs/:id/complete`, `/internal/jobs/:id/fail`
- [ ] Worker auth middleware (shared secret header validation)
- [ ] Graceful shutdown handler

> 📌 **Commit:** `feat(worker): scaffold Render worker with internal job routes`

---

### 0.4 Database setup
- [ ] Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `postgres`
- [ ] `packages/database/src/client.ts` — pooled Neon client for serverless, direct client for migrations
- [ ] `packages/database/drizzle.config.ts`
- [ ] Create `.env.example` with all required variables (DATABASE_URL, etc.) — **no real secrets**
- [ ] Validate env vars at startup using Zod (fail fast if missing)

> 📌 **Commit:** `chore(database): add Drizzle + Neon client and env validation`

---

### 0.5 CI pipeline
- [ ] `.github/workflows/ci.yml`:
  - Install deps
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test` (unit)
  - `pnpm build`
  - Migration dry-run check
- [ ] Add `.gitignore` (node_modules, .env, .next, dist)

> 📌 **Commit:** `chore(ci): add GitHub Actions pipeline with typecheck, lint, test, build`

---

## Phase 1 — Database Schema (Full)

> **Goal:** All tables from §19 exist in Drizzle and are migrated to Neon.

### 1.1 Auth tables (§19.1)
- [x] `users` table with indexes on `lower(email)` and `status`
- [x] `sessions` table
- [x] `email_verification_tokens` table
- [x] `password_reset_tokens` table
- [x] `auth_attempts` table (for rate-limiting support)

> 📌 **Commit:** `feat(database): add auth tables — users, sessions, tokens, auth_attempts`

---

### 1.2 Org & membership tables (§19.2)
- [x] `organizations` table
- [x] `organization_members` table with unique constraint on `(organization_id, user_id)`

> 📌 **Commit:** `feat(database): add organizations and organization_members tables`

---

### 1.3 Agency profile tables (§19.3)
- [x] `agency_profiles` table
- [x] `agency_services` table
- [x] `ideal_customer_profiles` table
- [x] `case_studies` table
- [x] `case_study_services` join table

> 📌 **Commit:** `feat(database): add agency profile, services, ICP, and case study tables`

---

### 1.4 Prospect tables (§19.4)
- [x] `prospects` table with compound indexes on `(organization_id, created_at)`, `(organization_id, normalized_domain)`, `(organization_id, status)`
- [x] `prospect_competitors` table

> 📌 **Commit:** `feat(database): add prospects and prospect_competitors tables`

---

### 1.5 Analysis job tables (§19.5)
- [x] `analysis_jobs` table (statuses: queued, processing, completed, partial, failed, cancelled)
- [x] `analysis_job_steps` table with unique on `(analysis_job_id, step_key)`

> 📌 **Commit:** `feat(database): add analysis_jobs and analysis_job_steps tables`

---

### 1.6 Source & technical check tables (§19.6)
- [x] `source_pages` table
- [x] `technical_checks` table
- [x] `pagespeed_results` table

> 📌 **Commit:** `feat(database): add source_pages, technical_checks, pagespeed_results tables`

---

### 1.7 Report tables (§19.7)
- [x] `reports` table
- [x] `report_scores` table
- [x] `report_findings` table
- [x] `finding_sources` table
- [x] `service_recommendations` table
- [x] `report_outreach` table
- [x] `report_call_questions` table
- [x] `report_objections` table
- [x] `proposal_starters` table

> 📌 **Commit:** `feat(database): add all report-related tables`

---

### 1.8 AI operations & feedback tables (§19.8–19.9)
- [x] `ai_runs` table
- [x] `prompt_versions` table
- [x] `finding_feedback` table
- [x] `report_feedback` table
- [x] `usage_events` table
- [x] `audit_logs` table

> 📌 **Commit:** `feat(database): add ai_runs, prompt_versions, feedback, usage, audit tables`

---

### 1.9 Data access layer
- [x] `packages/database/src/queries/` — one file per domain (users, sessions, prospects, reports, jobs, agency)
- [x] Every query that touches org-owned data **must** accept and filter by `organizationId` — never trusted from the client
- [x] Repository pattern: no raw SQL in application code

> 📌 **Commit:** `feat(database): add data access layer with organization isolation`

---

## Phase 2 — Authentication

> **Goal:** Secure, custom auth as described in §11.1 and §18.4. No third-party auth SDK yet.
>
> **How to implement custom auth:**
> - Use `argon2` npm package for password hashing (argon2id variant)
> - Generate session tokens with `crypto.randomBytes(32)`, store only the SHA-256 hash in the DB
> - Set cookies with `httpOnly: true`, `secure: true`, `sameSite: 'lax'`, `path: '/'`
> - Derive the active org from the session row — never from a cookie or request body
> - Rate limit per IP and per email using a leaky-bucket counter in `auth_attempts` or Redis (pg-based is fine for MVP)

### 2.1 Core auth services (`packages/auth`)
- [x] `hashPassword(password: string): Promise<string>` — argon2id
- [x] `verifyPassword(password: string, hash: string): Promise<boolean>`
- [x] `generateToken(): string` — crypto random hex
- [x] `hashToken(token: string): string` — SHA-256 hex
- [x] `createSession(userId, ip, userAgent): Promise<{ token, session }>` — inserts session, returns raw token for cookie
- [x] `validateSession(token: string): Promise<Session & { user, organization } | null>` — reads hashed token, checks expiry
- [x] `revokeSession(sessionId)` and `revokeAllSessions(userId)`

> 📌 **Commit:** `feat(auth): core password hashing, session creation, and validation`

---

### 2.2 Email verification
- [x] `createVerificationToken(userId)` — stores hashed token, 24h expiry
- [x] `verifyEmailToken(token)` — validates, marks `users.email_verified_at`, invalidates token
- [x] Nodemailer + Brevo SMTP setup in `packages/auth` (env-controlled)
- [x] Email template: verification link

> 📌 **Commit:** `feat(auth): email verification token generation and email sending`

---

### 2.3 Password reset
- [x] `createPasswordResetToken(email)` — never reveal if email exists in response
- [x] `resetPassword(token, newPassword)` — validates token, hashes new password, invalidates all sessions
- [x] Email template: reset link with 1h expiry

> 📌 **Commit:** `feat(auth): password reset with hashed tokens and user enumeration protection`

---

### 2.4 Rate limiting & CSRF
- [x] Login rate limit: 10 attempts per 15 min per IP (use `auth_attempts` table)
- [x] Registration rate limit: 5 per hour per IP
- [x] Password reset rate limit: 3 per hour per email
- [x] CSRF: Double-submit cookie pattern or `SameSite=Lax` + origin check for state-mutating routes

> 📌 **Commit:** `feat(auth): rate limiting for login, register, and password reset`

---

### 2.5 Auth API routes (`apps/web/app/api/auth/`)
- [x] `POST /api/auth/register` — validate with Zod, hash password, create user + org + session
- [x] `POST /api/auth/login` — validate, verify password, create session, set cookie
- [x] `POST /api/auth/logout` — revoke current session, clear cookie
- [x] `POST /api/auth/logout-all` — revoke all sessions
- [x] `POST /api/auth/verify-email` — validate token, mark verified
- [x] `POST /api/auth/resend-verification`
- [x] `POST /api/auth/forgot-password`
- [x] `POST /api/auth/reset-password`

> 📌 **Commit:** `feat(auth): all auth API routes with Zod validation and secure responses`

---

### 2.6 Middleware & session context
- [x] `middleware.ts` — reads session cookie, validates session, attaches user to request context (or redirects)
- [x] `lib/auth/session.ts` — `getSession()` helper for server components and route handlers
- [ ] Protect all `(app)/` routes: redirect unauthenticated users to `/login`
- [ ] Redirect authenticated users away from `/login` and `/register`

> 📌 **Commit:** `feat(auth): middleware session validation and route protection`

---

### 2.7 Auth UI pages (§15.5, §15.6, §15.7)
- [x] **Sign-up page** (`/register`) — editorial split screen: form left, rotating insight examples right
- [x] **Login page** (`/login`) — calm single-panel with animated "lens scan" visual (SVG/CSS animation)
- [x] **Email verification page** (`/verify-email`) — mail-path visualization: sent → inbox → verify → continue
  - Masked email display, resend timer (60s countdown), change-email link
- [x] **Forgot password page** (`/forgot-password`)
- [x] **Reset password page** (`/reset-password?token=...`)
- [x] All forms: React Hook Form + Zod, inline validation, loading states, error states from §15.5

> 📌 **Commit:** `feat(web): auth pages — register, login, verify-email, password-reset with premium UI`

---

## Phase 3 — Agency Onboarding

> **Goal:** New user can set up their full agency profile as described in §11.2.

### 3.1 Onboarding shell
- [x] Route group `(app)/onboarding/` with step routing: `/onboarding/identity`, `/services`, `/icp`, `/case-studies`, `/first-analysis`
- [x] Progress indicator at top (completion %)
- [x] Skip button for optional steps
- [x] Preserve progress when navigating backward

> 📌 **Commit:** `feat(onboarding): multi-step onboarding shell with progress tracking`

---

### 3.2 Step 1 — Agency identity (§11.2 Step 1, §15.8)
- [x] Form fields: agency name, website, country, timezone, short description, logo URL or initials, team size, primary service category
- [x] Live **agency brand preview** on the right (shows how agency appears inside reports)
- [x] On mobile: preview collapses to expandable section, sticky Continue button
- [x] Save to `agency_profiles`

> 📌 **Commit:** `feat(onboarding): agency identity step with live brand preview`

---

### 3.3 Step 2 — Services (§11.2 Step 2, §15.9)
- [x] **Service architecture board** — each service is a structured block (not a plain repeating form)
- [x] Fields per service: name, description, problem solved, deliverables, price min/max, preferred industries, disqualifiers, priority, active toggle
- [x] Add, duplicate, reorder (drag or up/down), deactivate services
- [x] On mobile: each service is an expandable accordion
- [x] Save to `agency_services`

> **Implementation note:** Use `@dnd-kit/core` for drag-to-reorder. Price stored in cents in DB, displayed as formatted currency in UI.

> 📌 **Commit:** `feat(onboarding): services architecture board with drag-reorder and CRUD`

---

### 3.4 Step 3 — Ideal customer profile (§11.2 Step 3, §15.10)
- [x] **Fit spectrum** UI — for each dimension (company size, industry, budget, geography, website condition, urgency) user sets: Best fit / Acceptable / Poor fit
- [x] Fields: company size ranges, target industries, locations, preferred website maturity, min project budget, common problems, buying signals, disqualifying factors, preferred decision-maker roles
- [x] Save to `ideal_customer_profiles`

> 📌 **Commit:** `feat(onboarding): ICP fit spectrum with dimension-based configuration`

---

### 3.5 Step 4 — Case studies (§11.2 Step 4, §15.11)
- [x] **Case-study story builder** — visual flow: Problem → Solution → Result
- [x] Live "proof card" preview showing what AI may retrieve
- [x] Fields: title, client industry, client type, problem, solution, deliverables, results, metrics, service tags, case-study URL, public/private status
- [x] Empty state: guided example with option to skip
- [x] Save to `case_studies` + `case_study_services`

> 📌 **Commit:** `feat(onboarding): case study story builder with proof card preview`

---

### 3.6 Step 5 — Output preferences (§11.2 Step 5)
- [x] Fields: brand voice (dropdown + custom), outreach tone, preferred outreach channel, report depth, technical detail level, proposal style, avoided phrases, CTA preference
- [x] Save to `agency_profiles`

> 📌 **Commit:** `feat(onboarding): output preferences step`

---

### 3.7 Setup completeness
- [x] Calculate `setupCompleteness` percentage (agency name + 1 service = minimum; case study, ICP, preferences add more)
- [x] Display on dashboard and agency profile page
- [x] Show warning on first report if agency context is too sparse

> 📌 **Commit:** `feat(agency): setup completeness calculation and display`

---

## Phase 4 — Design System & App Shell

> **Goal:** Every app page uses a consistent, premium design system.

### 4.1 Design tokens
- [x] CSS custom properties for all color tokens from §13.3 (light + dark)
- [x] Typography scale: Display, H1–H3, Body, Small (§13.3)
- [x] Spacing scale: 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)
- [x] Border-radius: 8px small, 12px card, 16px panel, 20–28px hero
- [x] Motion timing variables from §13.4

> 📌 **Commit:** `style(web): implement design token system — colors, typography, spacing, motion`

---

### 4.2 Core component library (`packages/ui`)
- [x] **App shell** — responsive sidebar + main content area
- [x] **Sidebar** — persistent on desktop, drawer on mobile/tablet (§14.2)
- [x] **Score ring** — animated SVG circle showing 0–100 score with label (see §11.7)
- [x] **Confidence badge** — Low/Medium/High pill
- [x] **Severity badge** — color-coded pill (critical, warning, info)
- [x] **Source chip** — URL + accessed time + confidence
- [x] **Finding card** — left severity rail + expandable evidence section (§15.18)
- [x] **Toast** — entrance animation, accessible (§16.1)
- [x] **Skeleton loader** — subtle shimmer, not overdone
- [x] **Empty state** — reason + value + action + optional example (§15.30)
- [ ] **Error panel** — explains what failed, what succeeded, retry option (§15.31)
- [ ] **Confirmation dialog** — required for destructive actions (§16.2)
- [ ] **Bottom sheet** — mobile filter/action drawer
- [ ] **Usage meter** — horizontal bar for analysis quota

> **Implementation note:** Every component must expose: loading, success, empty, error, disabled states. Use Radix UI primitives for modal focus trapping and accessibility. Reduced-motion via `prefers-reduced-motion` media query.

> 📌 **Commit:** `feat(ui): core component library — shell, cards, badges, toast, empty/error states`

---

### 4.3 Additional components
- [ ] **Command palette** — `Cmd+K` shortcut, global search stub
- [ ] **URL input** — large, prominent, with validation state
- [ ] **Editable AI text block** — shows AI-generated text with edit/restore/regenerate controls
- [ ] **Regenerate menu** — tone selector, length selector, regenerate button
- [ ] **Filter bar** — pill-based active filters + clear all
- [ ] **Data table** — TanStack Table, sortable, with pagination
- [ ] **Mobile sticky actions** — bottom bar for primary actions on mobile
- [ ] **Analysis timeline** — vertical/horizontal step list with status icons

> 📌 **Commit:** `feat(ui): secondary components — command palette, AI text block, filter bar, timeline`

---

## Phase 5 — Dashboard & Navigation

### 5.1 Main dashboard (§15.13)
- [x] **Asymmetric command center layout** — NOT an equal-size card grid
- [x] Top zone: greeting, large quick-analysis URL input, usage status, setup completeness
- [x] Main left column: high-potential prospects (score ≥ 80), recent reports, processing jobs
- [x] Right rail: score distribution histogram, most common detected problems, setup improvement suggestions, recent activity
- [x] Skeleton states for all async data
- [x] Mobile layout: quick analysis → processing jobs → prospects → compact metric summaries

> 📌 **Commit:** `feat(web): main dashboard with asymmetric layout and real data`

---

### 5.2 Prospects list page (§15.16)
- [x] View toggle: **Insight cards** (default) / **Compact table**
- [x] Card fields: company, domain, fit score (ring), main opportunity, best service match, last analyzed, status, pinned indicator
- [x] Filters: score range, service, status, date range, industry, confidence, archived, has outreach, has feedback
- [x] Pagination
- [x] On mobile: card mode only, filter bottom sheet

> 📌 **Commit:** `feat(web): prospects list with insight cards, table view, and filters`

---

### 5.3 Activity page (§15.27)
- [x] Chronological **analysis journal** with event types: report created, analysis completed, section regenerated, finding marked inaccurate, service updated, export generated, login security event
- [x] Filterable by event type and date range

> 📌 **Commit:** `feat(web): activity journal page`

---

## Phase 6 — Prospect Creation & URL Safety

> **Goal:** User can submit a prospect URL. It is validated, normalized, and SSRF-safe before any network call.

### 6.1 URL validation & normalization (`packages/analysis`)
- [x] Accept only `http://` and `https://` schemes
- [x] Block: localhost, 127.0.0.1, `::1`, `10.x`, `172.16–31.x`, `192.168.x`, `169.254.x`, cloud metadata IPs (169.254.169.254, etc.)
- [x] Normalize: lowercase protocol, strip trailing slash, resolve `www.` consistently
- [x] Detect duplicate analyses for the same org + domain within a configurable window — offer reuse / duplicate / rerun

> **Implementation note:** Resolve DNS before fetching using Node's `dns.promises.lookup`. Re-check IP after each redirect. Limit redirects to 5. Set a 10s response timeout. Cap response at 5MB. Only accept `text/html` and `text/plain` content types from crawled pages.

> 📌 **Commit:** `feat(analysis): URL validation, normalization, and SSRF protection`

---

### 6.2 New analysis page (§15.14)

> 📌 **Commit:** `feat(web): new analysis composer — 3-step form with prospect/context/output`

---

## Phase 7 — Website Crawler & Technical Analysis

> **Goal:** Worker can crawl a public website, extract structured data, and run technical checks.

### 7.1 Page discovery (§11.4)
- [x] Fetch submitted URL → follow redirect chain (max 5)
- [x] Parse `robots.txt` — respect `Disallow` rules
- [x] Parse `sitemap.xml` — collect up to `MAX_PAGES` URLs
- [x] Extract navigation links from homepage HTML
- [x] Add likely page slugs: `/about`, `/services`, `/contact`, `/pricing`, `/case-studies`, etc.
- [x] Deduplicate, normalize, keep same-domain only
- [x] Default limit: 8 pages. Configurable via env.

> 📌 **Commit:** `feat(analysis): page discovery — robots.txt, sitemap, nav links, likely pages`

---

### 7.2 Page fetching & Cheerio extraction (§11.4)
- [x] Fetch each discovered page with native `fetch` + request timeout + size limit
- [x] Parse HTML with Cheerio — extract:
  - [x] Page title, meta description, canonical URL
  - [x] H1–H6 structure
  - [x] Main body text (remove nav, footer, scripts, styles — see content quality controls)
  - [x] Navigation labels and CTAs
  - [x] Forms (presence, field count)
  - [x] Email addresses and phone numbers
  - [x] Social links
  - [x] Schema.org JSON-LD
  - [x] Image count and missing-alt count
  - [x] Internal and external link counts
  - [x] Copyright year
  - [x] Language attribute
  - [x] Response status + redirect chain
  - [x] Security headers (`X-Frame-Options`, `CSP`, `HSTS`, etc.)
- [x] Detect near-duplicate pages (content hash comparison)
- [x] Truncate body text safely; preserve source-to-text mapping for citations
- [x] Save each page to `source_pages`

> 📌 **Commit:** `feat(analysis): Cheerio extraction — content, meta, CTAs, forms, social, schema`

---

### 7.3 Technical checks (§11.5)
- [x] HTTP status and final URL
- [x] HTTPS availability check
- [x] Response time measurement
- [x] Compression header check (`Content-Encoding`)
- [x] Cache headers (`Cache-Control`, `ETag`, `Expires`)
- [x] Security headers check (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- [x] Mixed-content hints (http:// references inside https site)
- [x] Viewport meta tag presence
- [x] Robots meta tag
- [x] Missing title / missing meta description detection
- [x] Missing heading structure detection
- [x] Missing image alt text count
- [x] Sitemap and robots.txt presence
- [x] Copyright year freshness
- [x] Save all checks to `technical_checks`

> 📌 **Commit:** `feat(analysis): technical checks — headers, security, SEO basics, content quality`

---

### 7.4 Technology detection (§11.5)
- [x] Detect from: HTML signatures, script URLs, meta-generator tags, response headers, asset paths, public JS variables, known CMS markers
- [x] Output per detection: `{ name, confidence: 'confirmed' | 'likely' | 'unknown', category }`
- [x] Common targets: WordPress, Shopify, Wix, Squarespace, Webflow, Next.js, React, jQuery, Bootstrap, GTM, GA, HubSpot, Intercom

> 📌 **Commit:** `feat(analysis): lightweight technology detection with confidence levels`

---

### 7.5 PageSpeed Insights integration (§11.5)
- [x] `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...&strategy=mobile`
- [x] Extract: performance, accessibility, SEO, best-practices scores; FCP, LCP, CLS, TBT, Speed Index; opportunity list
- [x] Run mobile by default; run desktop if quota permits
- [x] Handle API unavailability gracefully — mark step as partial
- [x] Save to `pagespeed_results`

> 📌 **Commit:** `feat(analysis): PageSpeed Insights API integration with graceful failure`

---

## Phase 8 — Job Queue & Worker Orchestration

> **Goal:** Analysis jobs run reliably, survive browser closure, are retryable, and report progress.

### 8.1 Job queue (PostgreSQL-based polling)
- [x] `analysis_jobs.status` state machine: `queued → processing → completed | partial | failed | cancelled`
- [x] Worker polls DB every N seconds for `status = 'queued'` jobs — SELECT FOR UPDATE SKIP LOCKED to prevent duplicate claims
- [x] Worker sets `status = 'processing'`, `worker_id`, `started_at`
- [x] Heartbeat: worker updates `updated_at` every 30s; a job is considered stale if no heartbeat for >2m (allows reassignment)
- [x] On worker restart: reset stale `processing` jobs to `queued`

> **Implementation note:** `SELECT FOR UPDATE SKIP LOCKED` is the key pattern here. It ensures no two workers pick the same job even under concurrent polling. Use it in the `claim` query.

> 📌 **Commit:** `feat(worker): job queue with SELECT FOR UPDATE SKIP LOCKED and heartbeat`

---

### 8.2 Step orchestration
- [x] Each step writes to `analysis_job_steps` (key, status, started_at, completed_at, error)
- [x] Step keys: `discover_pages`, `fetch_pages`, `technical_checks`, `pagespeed`, `technology_detection`, `ai_extraction`, `ai_classification`, `ai_service_match`, `ai_fit_score`, `ai_outreach`, `ai_call_prep`, `ai_proposal`, `ai_verify`, `save_report`
- [x] A failed step does not abort subsequent independent steps unless required — partial reports are valid
- [x] Step-level retry: exponential backoff, max 3 retries per step

> 📌 **Commit:** `feat(worker): step-level orchestration with partial success and retries`

---

### 8.3 Progress reporting
- [x] Worker POSTs to `/internal/jobs/:id/progress` with `{ currentStep, progressPercent }` after each step
- [x] Vercel route handler writes to `analysis_jobs` and broadcasts (or stores for polling)
- [x] Frontend polls `GET /api/analyses/:id` every 3–5s while status is `processing`

> 📌 **Commit:** `feat(worker): progress reporting via internal API`

---

### 8.4 Analysis processing UI (§15.15)
- [x] **Live evidence pipeline** — NOT a spinner. Vertical stage list with status icons.
- [x] Stages (in order): Connecting → Discovering pages → Reading content → Running technical checks → Matching agency services → Generating strategy → Verifying sources → Finalizing
- [x] Right/lower panel: live partial evidence as collected (pages found, tech hints, PageSpeed status, sources captured)
- [x] States: Queued, Running, Partially completed, Rate-limited, Waiting for fallback, Failed, Completed
- [x] Actions: Leave safely, request email on complete, cancel (if supported), retry failed step, view diagnostics
- [x] On mobile: vertical timeline, evidence in expandable rows

> 📌 **Commit:** `feat(web): analysis processing page with live evidence pipeline UI`

---

## Phase 9 — AI Report Generation

> **Goal:** Structured, source-backed Opportunity Brief generated by Gemini with Groq fallback.

### 9.1 AI provider abstraction (`packages/ai`)
- [x] `AIProvider` interface: `generate(prompt: string, schema: ZodSchema, options?: AIOptions): Promise<T>`
- [x] `GeminiProvider` implementation using `@google/generative-ai`
- [x] `GroqProvider` implementation using `groq-sdk`
- [x] `withFallback(primary, fallback)` — try primary, fall back to Groq on failure/rate-limit
- [x] Zod validation of every AI response — retry up to 3x if schema invalid
- [x] Log every run to `ai_runs` (provider, model, purpose, tokens, latency, retry count, fallback used)
- [x] Model names from env vars — never hardcoded

> **Implementation note:** Use Gemini's `generationConfig.responseMimeType = 'application/json'` for structured output. For Groq, use `response_format: { type: 'json_object' }`. Always parse with Zod after receiving.

> 📌 **Commit:** `feat(ai): provider abstraction with Gemini/Groq, Zod validation, fallback, and run logging`

---

### 9.2 Prompt architecture
- [ ] Prompts live in `packages/ai/prompts/` as versioned TypeScript files (not inline strings)
- [ ] Each prompt is a function that accepts typed inputs and returns a string
- [ ] Prompt versions stored in `prompt_versions` table — log which version was used for each `ai_run`
- [ ] Prompt structure per AI stage (see §11.6):

#### Stage 1 — Fact extraction
Input: raw page text, technical checks, PageSpeed scores, detected technologies
Output schema: `{ companyName, industry, offerings, audience, businessModel, contactChannels, socialLinks, copyrightYear, technologiesUsed }`

#### Stage 2 — Business classification
Input: fact extraction output
Output schema: `{ primaryCategory, secondaryCategory, businessMaturity, targetMarket, revenueModel, growthSignals, risks }`

#### Stage 3 — Website issue classification
Input: technical checks + PageSpeed + extracted content
Output schema: `{ findings: [{ title, category, severity, observation, evidence, businessImpact, recommendation, confidence, sourceUrl }] }`

#### Stage 4 — Opportunity hypothesis
Input: business classification + findings
Output schema: `{ hypotheses: [{ thesis, evidence, buyingSignals, risks, requiredProof }] }`

#### Stage 5 — Agency service matching
Input: opportunity hypothesis + agency profile + services + ICP
Output schema: `{ serviceMatches: [{ serviceId, matchScore, rationale, suggestedScope, risks }], primaryServiceId, secondaryServiceId }`

#### Stage 6 — Fit scoring
Input: all above + agency ICP
Output schema: `{ overallScore, scoreLabel, confidence, scoreBreakdown: { agencyServiceFit, problemSeverity, businessMaturity, likelyProjectValue, evidenceQuality, outreachReadiness }, positiveFactors, negativeFactors, missingInformation }`

#### Stage 7 — Outreach generation
Input: report summary + agency voice + service match + prospect context
Output schema: `{ subjectLines, emailOpener, emailBody, linkedInMessage, whatsappMessage, followUpMessage, callToAction, phrasesToAvoid }`

#### Stage 8 — Discovery-call preparation
Input: report + opportunity hypothesis
Output schema: `{ hypotheses, priorityQuestions, technicalQuestions, businessQuestions, budgetQuestions, timelineQuestions, stakeholderQuestions, warningSignals, objections: [{ objection, suggestedResponse }] }`

#### Stage 9 — Proposal angle
Input: service match + opportunity hypothesis + case studies
Output schema: `{ problemStatement, objectives, proposedScope, phases, successMetrics, relevantCaseStudyId, risks, assumptions, nextStep }`

#### Stage 10 — Source & confidence verification
Input: all findings + source pages
Output schema: `{ verifiedFindings: [{ findingId, sourceUrls, confidence, isFactOrInference }], limitations, unsupportedAreas }`

> 📌 **Commit:** `feat(ai): all 10 AI stage prompts with typed inputs, versioning, and Zod schemas`

---

### 9.3 Output quality rules (§11.6)
- [x] Auth tables (§19.1) — `users`, `sessions`, `email_verification_tokens`, `password_reset_tokens`, `auth_attempts`
- [x] Org & membership tables (§19.2) — `organizations`, `organization_members`
- [x] Agency profile tables (§19.3) — `agency_profiles`, `agency_services`, `ideal_customer_profiles`, `case_studies`
- [x] Prospect tables (§19.4) — `prospects`, `prospect_competitors`
- [x] Analysis job tables (§19.5) — `analysis_jobs`, `analysis_job_steps`
- [x] Source & technical check tables (§19.6) — `source_pages`, `technical_checks`, `pagespeed_results`
- [x] Report tables (§19.7) — `reports`, `report_scores`, `report_findings`, `finding_sources`, `service_recommendations`, `report_outreach`, `report_call_questions`, `report_objections`, `proposal_starters`
- [x] AI operations & feedback tables (§19.8–19.9) — `ai_runs`, `prompt_versions`, `finding_feedback`, `report_feedback`, `usage_events`, `audit_logs`
- [x] Data access layer (`packages/database/src/index.ts` exports)
- [x] Every factual claim must reference a `sourceUrl` from `source_pages`
- [x] Inferences labeled `type: 'inference'` — never presented as facts in UI
- [x] No invention of revenue, headcount, budget, or internal strategy
- [x] Contact-person claims require public evidence string
- [x] If data is incomplete, include a limitations object

> 📌 **Commit:** `feat(ai): output quality enforcement — source linking, inference labeling, limitations`

---

### 9.4 Report persistence
- [x] After all AI stages complete, save to: `reports`, `report_scores`, `report_findings`, `finding_sources`, `service_recommendations`, `report_outreach`, `report_call_questions`, `report_objections`, `proposal_starters`
- [x] Report creation is idempotent — use `analysis_job_id` as the dedup key
- [x] Set `analysis_jobs.status = 'completed'` and `completed_at`
- [x] Trigger email notification if user opted in

> 📌 **Commit:** `feat(worker): report persistence across all related tables with idempotency`

---

## Phase 10 — Report Experience

> **Goal:** Premium, multi-section report UI covering all 10 sections of §11.8.

### 10.1 Report overview (§15.17)
- [ ] **Three-panel intelligence layout** on desktop:
  - Left rail: sticky nav + prospect identity
  - Main column: Opportunity Thesis (editorially styled block), recommended next action, key findings, service match
  - Right rail: score ring, confidence, sources, notes, quick actions
- [ ] Mobile: sticky compact header, horizontal section nav, score summary, bottom sheet for quick actions

> 📌 **Commit:** `feat(web): report overview — three-panel layout with opportunity thesis`

---

### 10.2 Findings page — Evidence map (§15.18)
- [ ] Findings grouped by: Conversion, Performance, UX, Accessibility, SEO, Trust, Technology, Security Basics
- [ ] Each finding card: left severity rail (color-coded), title, severity badge, evidence type, observation, business impact, recommendation, matched service, source, confidence, feedback buttons (useful / inaccurate)
- [ ] Expanding a card shows full evidence section
- [ ] Desktop: selecting a finding opens source preview in a right side panel
- [ ] Mobile: source preview opens as full-height sheet
- [ ] Pin / hide / reorder findings

> 📌 **Commit:** `feat(web): findings evidence map with grouped cards, source preview, and feedback`

---

### 10.3 Opportunities page — Service-match matrix (§15.19)
- [ ] **Matrix layout**: rows = prospect problems, columns = agency services, cells = match strength (color intensity)
- [ ] Below matrix: primary offer, secondary offer, recommended scope, suggested phases, project range, proof required
- [ ] Visual explanation of why an offer is recommended

> 📌 **Commit:** `feat(web): opportunities page with service-match matrix`

---

### 10.4 Outreach page — Message studio (§15.20)
- [ ] Left: channel selector (email/LinkedIn/WhatsApp), tone, length, CTA selector, included evidence checkboxes
- [ ] Center: editable message body, subject line options, follow-up message
- [ ] Right: personalization checklist, claims + sources, risk warnings, copy buttons
- [ ] Mobile: settings in top drawer, editor full width, sticky Copy button at bottom
- [ ] Persist user edits to `report_outreach.user_edited_body`

> 📌 **Commit:** `feat(web): outreach message studio with channel/tone/length controls`

---

### 10.5 Call preparation page — Meeting room board (§15.21)
- [ ] Sections: What we think / What we need to validate / Questions to ask / Signals to listen for / Objections / Next-step recommendation
- [ ] Questions can be checked/unchecked during a call (saved to `report_call_questions.is_checked`)
- [ ] Notes field per question

> 📌 **Commit:** `feat(web): call prep board with interactive question checklist`

---

### 10.6 Proposal starter page (§15.22)
- [ ] **Structured document canvas** with section navigation
- [ ] Sections: Context → Problem → Objectives → Scope → Phases → Success Metrics → Assumptions → Relevant Proof → Next Steps
- [ ] Inline editing for each section
- [ ] Save edits to `proposal_starters.user_edited_content`
- [ ] Markdown export button

> 📌 **Commit:** `feat(web): proposal starter with inline editing and Markdown export`

---

### 10.7 Sources ledger page (§15.23)
- [ ] **Source ledger table** — NOT hidden in a modal
- [ ] Per source: URL, page title, source type, accessed time, supported findings (clickable), extraction status, confidence, failure reason
- [ ] Click a finding to highlight all sources that support it

> 📌 **Commit:** `feat(web): sources ledger page with finding-to-source cross-referencing`

---

### 10.8 Report editing & regeneration (§11.9)
- [ ] Edit generated text inline (any section)
- [ ] Restore original AI-generated version
- [ ] Regenerate a single section without regenerating the whole report
  - Select tone and length before regenerating
  - Show inputs used
  - Confirm before overwriting manual edits
  - Retain prior generated version for limited period
- [ ] Copy section / copy whole report
- [ ] Mark finding as useful / inaccurate / irrelevant / unclear (saves to `finding_feedback`)
- [ ] Add private notes
- [ ] Pin / hide findings
- [ ] Export to Markdown
- [ ] Print-friendly view

> 📌 **Commit:** `feat(web): report editing — inline edit, restore, regenerate section, copy, export, feedback`

---

## Phase 11 — Agency Management Pages

### 11.1 Agency profile page (§15.24)
- [ ] **Profile dossier** layout: identity summary, positioning, service snapshot, ICP snapshot, case-study strength, setup completeness, AI understanding preview
- [ ] Answers: "What does LeadLens currently understand about my agency?"

> 📌 **Commit:** `feat(web): agency profile dossier page`

---

### 11.2 Services page (§15.25)
- [ ] **Service portfolio map** — grouped by: Strategy / Design / Development / Growth / Automation
- [ ] Per service: fit criteria, price range, related case studies, usage count in reports, active status toggle
- [ ] Inline CRUD (edit, deactivate, delete with confirmation)

> 📌 **Commit:** `feat(web): services portfolio map with CRUD`

---

### 11.3 Case studies page (§15.26)
- [ ] **Proof library** — views: story cards / industry groups / service groups
- [ ] Each card: result + relevance (not just title)
- [ ] Add, edit, delete with confirmation

> 📌 **Commit:** `feat(web): case studies proof library with story cards`

---

## Phase 12 — Settings

### 12.1 Profile settings (§15.28)
- [ ] Name, email display, avatar/initials
- [ ] Save with optimistic update

> 📌 **Commit:** `feat(web): profile settings page`

---

### 12.2 Security settings (§15.28)
- [ ] Change password (requires current password)
- [ ] Active sessions list (device, IP, last seen, revoke individual)
- [ ] Logout all sessions
- [ ] Login history
- [ ] Delete account (confirmation dialog, email confirmation for destructive action)

> 📌 **Commit:** `feat(web): security settings — password change, session management, account deletion`

---

### 12.3 Notifications settings (§15.28)
- [ ] Toggle: report completion email on/off
- [ ] Toggle: product update email on/off
- [ ] Security emails always on (display only, no toggle)

> 📌 **Commit:** `feat(web): notification preference settings`

---

### 12.4 Data settings (§15.28)
- [ ] Export account data (JSON download)
- [ ] Delete individual reports
- [ ] Delete workspace (confirmation + 48h delay or immediate based on policy)
- [ ] Retention information display

> 📌 **Commit:** `feat(web): data settings — export, report deletion, workspace deletion`

---

## Phase 13 — Public Marketing Pages

> Design reference: §13, §15.1–§15.4. These pages are heavily design-forward.

### 13.1 Public home page (§15.1)
- [ ] **Split cinematic hero** — left: headline + CTAs, right: "lens" visualization (website → Opportunity Brief)
- [ ] Background: subtle layered grid + radial focus effect (SVG/CSS, no WebGL in MVP)
- [ ] Moving evidence ribbon (horizontal scroll or marquee): "Slow mobile checkout", "Weak service CTA", etc.
- [ ] Scroll narrative showing the analysis pipeline (§10.3 flowchart as a visual)
- [ ] Sections: Hero → Workflow strip → Before/after research comparison → Product demo → Evidence matrix → Agency-context matching → Brief preview → Use-case cards → Trust/source system → Pricing preview → FAQ → CTA → Footer
- [ ] URL input in hero: stores submitted URL temporarily, continues after signup
- [ ] Performance: lazy-load images, no layout shift
- [ ] Mobile: stacked hero, swipeable demo, scrollable ribbon, above-fold CTA

> 📌 **Commit:** `feat(web): public home page with split hero, evidence ribbon, and scroll narrative`

---

### 13.2 Product page (§15.2)
- [ ] **Vertical investigative timeline** layout
- [ ] Left: stage numbers + titles. Right: sticky product visual changes on scroll
- [ ] 6 stages: Enter website → Collect evidence → Diagnose problems → Match services → Prepare outreach → Enter the call
- [ ] Content: inputs/outputs, data collection, source handling, agency profile role, editing, limitations, security
- [ ] Mobile: sticky visual → inline cards per stage

> 📌 **Commit:** `feat(web): product page with scroll-driven investigative timeline`

---

### 13.3 Use cases page (§15.3)
- [ ] **Role-switching workspace** — tabs: Founder / Sales Rep / Strategist / Account Manager
- [ ] Switching tab changes: primary challenge, workflow, emphasized report sections, example outcome, CTA
- [ ] Mobile: segmented horizontal scroll control

> 📌 **Commit:** `feat(web): use cases page with role-switching workspace`

---

### 13.4 Pricing page (§15.4)
- [ ] **Usage simulator** above plan cards: user selects prospects/month + team size + export needs → page recommends a plan
- [ ] Plan cards: Free / Solo / Agency / Growth (exact prices TBD — show as hypotheses with "Early Access" framing)
- [ ] Monthly/annual toggle (annual shows savings)
- [ ] AI/analysis credit explanation
- [ ] FAQ section
- [ ] Fair-use language

> 📌 **Commit:** `feat(web): pricing page with usage simulator and plan cards`

---

### 13.5 Legal pages
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Acceptable Use Policy
- [ ] Cookie notice (if using any tracking)
- [ ] AI-processing disclosure
- [ ] Data deletion explanation

> 📌 **Commit:** `docs(web): legal pages — privacy, terms, acceptable use, AI disclosure`

---

## Phase 14 — Email System

### 14.1 Email infrastructure (§11.10)
- [ ] Nodemailer transport configured via env vars (SMTP host, port, user, pass)
- [ ] Brevo SMTP as default development transport
- [ ] Base email template (HTML + text fallback, brand colors, responsive)
- [ ] Template: email verification
- [ ] Template: password reset
- [ ] Template: report completed
- [ ] Template: report failed

> 📌 **Commit:** `feat(email): Nodemailer setup with Brevo SMTP and all MVP email templates`

---

## Phase 15 — Analytics, Error Monitoring & Observability

### 15.1 Product analytics (§18.10, §24)
- [ ] PostHog JS (free tier) installed in `apps/web`
- [ ] Server-side event capture for activation metrics (§24.2): account created, email verified, profile completed, service added, prospect submitted, report completed, outreach copied
- [ ] Engagement events (§24.3): regenerated section, finding marked useful, export generated, call-prep usage
- [ ] No sensitive data (passwords, session tokens, private notes) in any event

> 📌 **Commit:** `feat(web): PostHog analytics with activation and engagement events`

---

### 15.2 Error monitoring
- [ ] Sentry free tier — install `@sentry/nextjs` and Sentry Node for worker
- [ ] Capture unhandled exceptions in web + worker
- [ ] Do NOT include raw prompts or personal user data in Sentry breadcrumbs

> 📌 **Commit:** `feat(web): Sentry error monitoring for web and worker`

---

### 15.3 Structured logging
- [ ] Structured JSON logs in worker (`pino` or equivalent)
- [ ] Log fields: timestamp, level, jobId, step, duration, errorCode
- [ ] No sensitive data in logs

> 📌 **Commit:** `feat(worker): structured JSON logging with pino`

---

## Phase 16 — Security Hardening

### 16.1 Security headers
- [ ] `Content-Security-Policy` — strict for app, relaxed only where needed
- [ ] `Strict-Transport-Security` — max-age=31536000 in production
- [ ] `X-Frame-Options: DENY`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` — restrict camera, microphone, etc.
- [ ] Set via Next.js `headers()` in `next.config.ts`

> 📌 **Commit:** `feat(web): security headers — CSP, HSTS, X-Frame-Options, Referrer-Policy`

---

### 16.2 Security tests (§29.6)
- [ ] Unit test: SSRF IP block rules (all private ranges)
- [ ] Unit test: session token is never stored plaintext
- [ ] Unit test: cross-org query returns 0 results
- [ ] Integration test: login with wrong password returns generic error
- [ ] Integration test: using expired/used reset token fails
- [ ] Integration test: direct access to another org's report returns 403

> 📌 **Commit:** `test(security): SSRF, session, auth, and cross-tenant isolation tests`

---

## Phase 17 — Testing

### 17.1 Unit tests (§29.1)
- [ ] URL normalization edge cases
- [ ] SSRF IP validation (all private ranges, cloud metadata IPs)
- [ ] Opportunity score calculation
- [ ] Auth token hashing (hashToken is deterministic)
- [ ] Session expiry check
- [ ] Zod schema validation for all AI responses
- [ ] Technology detection signatures
- [ ] Source mapping accuracy

> 📌 **Commit:** `test(unit): URL normalization, SSRF, scoring, auth, AI schema, tech detection`

---

### 17.2 Integration tests (§29.2)
- [ ] Full registration flow: register → verify email → can log in
- [ ] Login with verified account → session created → logout → session revoked
- [ ] Password reset: request → token email → reset → old password rejected
- [ ] Agency setup: save services → retrieve correctly
- [ ] Prospect creation: valid URL → record created; SSRF URL → rejected
- [ ] Job creation → worker claims → completes → report exists
- [ ] Regeneration: one section only, no overwrite of manual edits without confirm
- [ ] Cross-tenant: user A cannot read user B's reports

> 📌 **Commit:** `test(integration): auth flows, agency setup, prospect creation, cross-tenant`

---

### 17.3 E2E tests (§29.3, §29.4)
- [ ] Playwright test: full signup → onboarding → submit prospect → processing page → open report
- [ ] Copy outreach button
- [ ] Export Markdown
- [ ] Edit service name
- [ ] Delete report (with confirmation)
- [ ] Mobile navigation (375px viewport)
- [ ] Visual regression snapshots: home, dashboard, processing page, report overview, findings, outreach studio

> 📌 **Commit:** `test(e2e): Playwright flows — onboarding, analysis, report actions, mobile nav`

---

### 17.4 Accessibility tests (§29.5)
- [ ] Axe automated checks on: home, login, dashboard, new analysis, report overview
- [ ] Keyboard-only flows: new analysis, copy outreach, navigate report sections
- [ ] Reduced-motion: confirm no forced animations when `prefers-reduced-motion: reduce`
- [ ] Contrast: all text passes AA minimum

> 📌 **Commit:** `test(a11y): axe checks, keyboard flows, reduced motion, contrast`

---

## Phase 18 — Deployment & Environments

### 18.1 Vercel deployment
- [ ] `vercel.json` or `next.config.ts` with region pinning
- [ ] All env vars set in Vercel project settings (never in code)
- [ ] Preview deployments for every PR
- [ ] Validate: all required env vars present at build time (startup check)

> 📌 **Commit:** `chore(deploy): Vercel configuration with env validation`

---

### 18.2 Render worker deployment
- [ ] `render.yaml` with worker service definition
- [ ] Health check endpoint: `GET /health` returns `{ status: 'ok' }`
- [ ] Startup: validate all required env vars (fail fast)
- [ ] Auto-restart on crash

> 📌 **Commit:** `chore(deploy): Render worker service definition with health check`

---

### 18.3 Neon database setup
- [ ] Pooled connection string for Vercel (serverless)
- [ ] Direct connection string for migrations (not exposed to serverless functions)
- [ ] `drizzle-kit push` for initial schema deployment
- [ ] Migration validation in CI

> 📌 **Commit:** `chore(deploy): Neon connection setup with pooled and direct clients`

---

## Phase 19 — Alpha Readiness

### 19.1 Help center shell (§15.29)
- [ ] **Task-based help explorer** — categories: Getting started, Improving reports, Understanding scores, Managing agency context, Troubleshooting analysis, Privacy and data
- [ ] Basic search
- [ ] Contextual help links from product pages

> 📌 **Commit:** `feat(web): help center with task-based categories and search`

---

### 19.2 Admin diagnostics (§31)
- [ ] Internal admin route (e.g., `/admin`) — strongly restricted, requires elevated session flag
- [ ] Views: users list, organizations, failed jobs, AI provider failure log, usage summary, feedback, security events
- [ ] No raw session tokens or passwords ever displayed

> 📌 **Commit:** `feat(web): internal admin panel with job diagnostics and usage view`

---

### 19.3 Feedback collection
- [ ] Report usefulness rating (1–10) with optional comment
- [ ] "Time saved estimate" field
- [ ] Toggle: used for outreach / used for call / used for proposal
- [ ] Save to `report_feedback`

> 📌 **Commit:** `feat(web): report feedback collection with usefulness rating`

---

### 19.4 Usage limits
- [ ] Track analysis count per org per billing period in `usage_events`
- [ ] Enforce configurable monthly limit — show current usage in dashboard and new analysis page
- [ ] Graceful "limit reached" state with upgrade CTA placeholder

> 📌 **Commit:** `feat(web): usage limit tracking and enforcement with graceful UI states`

---

### 19.5 Data deletion & export
- [ ] `GET /api/data/export` — returns JSON with all user's prospects, reports, agency data
- [ ] `DELETE /api/data/account` — deletes user + org + all data, requires email confirmation
- [ ] Individual report deletion: `DELETE /api/reports/:id` with confirmation dialog

> 📌 **Commit:** `feat(web): data export and account deletion with email confirmation`

---

### 19.6 Launch checklist verification
- [ ] [ ] Auth reviewed (hashing, tokens, cookies, CSRF, rate limits)
- [ ] [ ] SSRF defenses tested end-to-end
- [ ] [ ] Rate limits active in production config
- [ ] [ ] Cross-tenant isolation tests passing
- [ ] [ ] Secrets rotated (no dev secrets in production)
- [ ] [ ] Security headers configured and verified
- [ ] [ ] Data deletion flow working
- [ ] [ ] Job retries + worker restart tested
- [ ] [ ] Partial report state tested (one AI stage fails)
- [ ] [ ] Provider fallback tested (Gemini unavailable → Groq)
- [ ] [ ] Accessibility review
- [ ] [ ] Keyboard navigation tested on all core flows
- [ ] [ ] Reduced-motion verified
- [ ] [ ] Responsive layout from 320px upward
- [ ] [ ] Copy and export tested
- [ ] [ ] PostHog metrics landing in dashboard
- [ ] [ ] Legal pages published
- [ ] [ ] Pilot agencies selected and onboarded

> 📌 **Commit:** `chore(alpha): final alpha readiness verification and launch checklist`

---

## Commit Quick Reference

| Scope | Examples |
|---|---|
| `repo` | monorepo setup, CI, tooling |
| `database` | schema, migrations, queries |
| `auth` | authentication features |
| `analysis` | crawling, extraction, tech checks |
| `ai` | prompts, providers, orchestration |
| `worker` | job queue, orchestration, worker |
| `web` | Next.js frontend pages and UI |
| `ui` | shared component library |
| `email` | email templates and transport |
| `deploy` | Vercel, Render, Neon config |
| `test` | test files (unit/integration/e2e) |
| `docs` | documentation, legal pages |
| `security` | security-specific changes |
| `style` | CSS, design tokens |

---

*Last updated: 2026-07-26. Covers PRD v1.0 sections 1–37.*
