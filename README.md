# LeadLens

**Source-backed prospect intelligence for digital agencies.**

LeadLens turns a prospect's public website into an actionable sales brief. It discovers relevant pages, captures evidence, runs technical and performance checks, identifies commercial opportunities, matches those opportunities to an agency's services and proof, and prepares outreach, call questions, and a proposal direction.

Production: [leadlens.saevix.dev](https://leadlens.saevix.dev)

> LeadLens analyzes bounded public website content. It does not bypass authentication, submit forms, or replace independent verification of material claims.

## The problem

Agency prospecting often requires a seller to open many tabs, inspect a website manually, run separate audit tools, interpret technical findings, map those findings to services, and then write outreach from scratch. The result is slow, inconsistent, and difficult to defend when a prospect asks, "What did you actually observe?"

Generic AI summaries do not solve the core problem. Agencies need a point of view that is:

- grounded in evidence from the prospect's own public website;
- explicit about what is observed, inferred, or still unverified;
- connected to the services the agency can actually deliver;
- informed by its ideal customer profile and case studies; and
- ready to use in outreach, discovery calls, and proposals.

## The solution

LeadLens gives an agency a reusable research-to-revenue workflow:

1. Configure the agency profile, service catalog, ICP, case studies, and output preferences.
2. Add a prospect URL and optional sales context.
3. Run a durable, asynchronous website investigation.
4. Review findings with source excerpts, confidence, impact, and limitations.
5. Use service recommendations, fit scoring, outreach drafts, call preparation, and proposal direction.
6. Edit, version, regenerate, or export the resulting brief.

## Core capabilities

- **Public-site discovery:** inspects `robots.txt`, sitemaps, homepage navigation, and likely buying-journey pages.
- **Bounded evidence capture:** limits crawl size, page count, request duration, and prompt size.
- **Technical analysis:** reviews metadata, content structure, crawl health, page duplication, and related website signals.
- **PageSpeed insights:** supports mobile and desktop PageSpeed strategies.
- **Technology detection:** identifies relevant platforms and tooling.
- **Evidence-aware AI:** separates observations, hypotheses, and unverified claims and associates findings with captured sources.
- **Agency-specific matching:** uses services, pricing, ICP signals, and case studies instead of producing generic recommendations.
- **Sales outputs:** generates opportunity scoring, multichannel outreach, discovery questions, objection handling, and proposal starters.
- **Editable reports:** supports feedback, section regeneration, report versions, and restoration.
- **Exports:** produces Markdown, PDF, and DOCX reports.
- **Subscription billing:** provides Hobby, Solo, and Agency entitlements through Stripe Checkout, webhooks, and the customer portal.
- **Platform operations:** includes platform-owner views for users, organizations, billing, failed jobs, provider failures, security events, usage, and feedback.
- **Observability:** integrates Sentry, PostHog, structured worker logs, usage events, audit logs, and AI-run telemetry.

## Analysis pipeline

Every investigation is persisted as a job with 14 durable stages:

| # | Stage | Purpose |
|---:|---|---|
| 1 | `discover_pages` | Find public pages that shape the buying journey |
| 2 | `fetch_pages` | Capture and preserve usable page evidence |
| 3 | `technical_checks` | Inspect structure, metadata, duplication, and health |
| 4 | `pagespeed` | Collect performance, accessibility, SEO, and best-practice signals |
| 5 | `technology_detection` | Identify platforms and technology choices |
| 6 | `ai_extraction` | Extract source-backed business facts |
| 7 | `ai_classification` | Classify issues and likely commercial impact |
| 8 | `ai_service_match` | Match findings to the agency's services |
| 9 | `ai_fit_score` | Score and prioritize the opportunity |
| 10 | `ai_outreach` | Draft relevant outreach messages |
| 11 | `ai_call_prep` | Prepare discovery questions and objection responses |
| 12 | `ai_proposal` | Frame scope, outcomes, risks, and next steps |
| 13 | `ai_verify` | Check generated claims against captured evidence |
| 14 | `save_report` | Persist the final source-backed brief |

Failed stages remain visible and can be retried. A report can complete with limitations when non-critical stages fail; it is marked failed when no report can be created.

## Architecture

```mermaid
flowchart LR
    U[Browser] --> W[Next.js web app]
    W --> DB[(Neon PostgreSQL)]
    W --> S[Stripe]
    W --> M[SMTP provider]
    W --> Q[Analysis job queue]
    Q --> R{Execution mode}
    R -->|Long-running| WK[Express worker]
    R -->|Serverless cron| CR[/api/cron/process]
    WK --> P[14-stage orchestration]
    CR --> P
    P --> C[Public website crawler]
    P --> PS[PageSpeed API]
    P --> AI[Gemini / Groq]
    P --> DB
    W --> O[Sentry / PostHog]
    WK --> O
```

Jobs are claimed transactionally with PostgreSQL `FOR UPDATE SKIP LOCKED`, preventing multiple workers from processing the same queued job. Processing jobs that stop heartbeating are returned to the queue after a stale-job timeout.

## Tech stack

| Area | Technology |
|---|---|
| Web application | Next.js 16 App Router, React 19, TypeScript |
| Styling and interaction | Tailwind CSS 4, Framer Motion, Lucide React |
| Forms and validation | React Hook Form, Zod |
| Database | Neon PostgreSQL, Drizzle ORM, Drizzle Kit |
| Background processing | Node.js, Express, TSX, PostgreSQL job claiming |
| Website analysis | Cheerio, `robots-parser`, `ipaddr.js`, Google PageSpeed Insights |
| AI | Google Gemini with credential/model rotation, Groq fallback, schema-validated JSON outputs |
| Authentication | Argon2id passwords, hashed database sessions, email verification, password reset |
| Billing | Stripe Checkout, subscriptions, webhooks, customer portal |
| Email | Nodemailer with SMTP |
| Reports | `pdf-lib`, `docx`, Markdown export |
| Observability | Sentry, PostHog, Pino |
| Tooling | pnpm workspaces, ESLint, TypeScript, Vitest |
| Deployment | Vercel for the web app; standalone worker or authenticated serverless cron |

## Monorepo structure

```text
leadlens/
├── apps/
│   ├── web/              # Next.js marketing site, product UI, and API routes
│   └── worker/           # Long-running analysis worker and health endpoint
├── packages/
│   ├── ai/               # Providers, prompts, schemas, failover, and AI telemetry
│   ├── analysis/         # Discovery, safe fetching, extraction, and technical checks
│   ├── auth/             # Passwords, sessions, rate limits, and verification email
│   ├── config/           # Shared TypeScript configuration
│   ├── database/         # Drizzle client, schema, queries, and migrations
│   ├── email/            # Email transport and report notification templates
│   ├── orchestration/    # Durable 14-stage analysis workflow
│   ├── shared/           # Environment validation, billing plans, and shared security code
│   └── ui/               # Reusable UI primitives
├── scripts/              # Project utility scripts
├── .env.example          # Environment-variable template
├── render.yaml           # Optional standalone-worker deployment
└── pnpm-workspace.yaml   # Workspace definition
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- pnpm 10 (`corepack enable` is recommended)
- A PostgreSQL database; Neon is the intended provider
- At least one Gemini API key
- Optional: Groq, PageSpeed, SMTP, Stripe, Sentry, and PostHog credentials

### 1. Clone and install

```bash
git clone https://github.com/Jabirmahmud0/LeadLens.git
cd LeadLens
pnpm install
```

### 2. Configure the environment

Create the shared development environment from the template:

```powershell
Copy-Item .env.example .env
```

```bash
cp .env.example .env
```

Fill in the required values in `.env`, then copy it to both runtime applications:

```powershell
Copy-Item .env apps/web/.env -Force
Copy-Item .env apps/worker/.env -Force
```

```bash
cp .env apps/web/.env
cp .env apps/worker/.env
```

Never commit `.env` files or real API keys. The repository ignores local environment files.

### 3. Apply database migrations

Drizzle reads `DATABASE_URL` from the current shell. Use a direct PostgreSQL connection string for migrations when your provider offers separate direct and pooled URLs.

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://..."
pnpm db:migrate
Remove-Item Env:DATABASE_URL
```

Bash:

```bash
DATABASE_URL="postgresql://..." pnpm db:migrate
```

### 4. Start development

On Windows, the included helper synchronizes the root environment and starts both applications:

```powershell
.\dev.bat
```

Or start them from separate terminals:

```bash
pnpm --filter web dev
pnpm --filter worker dev
```

Open [http://localhost:3000](http://localhost:3000). The standalone worker exposes its health endpoint at [http://localhost:3001/health](http://localhost:3001/health).

## Environment variables

See [`.env.example`](./.env.example) for the complete template.

### Required core variables

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | Web, worker, migrations | PostgreSQL connection string |
| `SESSION_SECRET` | Web | Application session secret |
| `NEXT_PUBLIC_APP_URL` | Web, worker | Canonical application origin |
| `WORKER_SECRET` | Web, worker | Authenticates internal worker requests |
| `GEMINI_API_KEYS` | Worker | Comma-separated Gemini credential pool |
| `GEMINI_MODEL` | Worker | Preferred Gemini model |

### Optional integrations

| Group | Variables |
|---|---|
| Cron execution | `CRON_SECRET` |
| Groq fallback | `GROQ_API_KEY`, `GROQ_MODEL`, `AI_PRIMARY_PROVIDER` |
| PageSpeed | `PAGESPEED_API_KEY` |
| Crawl limits | `CRAWL_MAX_PAGES`, `CRAWL_FETCH_TIMEOUT_MS`, `CRAWL_MAX_DURATION_MS` |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| Stripe | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_SOLO_MONTHLY`, `STRIPE_PRICE_AGENCY_MONTHLY` |
| Platform bootstrap | `ADMIN_EMAILS` |
| Product analytics | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
| Error monitoring | `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, sampling variables |

`GEMINI_API_KEYS` accepts multiple comma-separated keys. Requests begin at rotating credential slots; key-specific quota or authentication failures advance to another slot. Model candidates are also attempted when a configured model is unavailable. Groq can act as the provider fallback.

## Billing plans

| Plan | Monthly price | Analyses | Included seats | Notes |
|---|---:|---:|---:|---|
| Hobby | $0 | 5/month | 1 | Standard web export |
| Solo | $49 | 50/month | Up to 3 | Case-study matching |
| Agency | $199 | 200/month | Up to 10 | White-labeled exports and advanced matching |
| Growth | Custom | Custom | Custom | Sales-assisted configuration |

Paid access is synchronized from signed Stripe webhook events. Webhook event IDs are persisted for idempotency, and older subscription events cannot overwrite newer subscription state.

## Background execution

LeadLens supports two job-processing modes:

### Standalone worker

Run `apps/worker` as a long-lived process. It polls for queued work, maintains a heartbeat, exposes `/health`, and can accept an authenticated `POST /internal/jobs/claim` request using the `x-worker-secret` header.

### Authenticated serverless cron

Call:

```text
POST /api/cron/process
Authorization: Bearer <CRON_SECRET>
```

This mode is suitable for an external scheduler when a continuously running worker is not available. The endpoint claims one queued job and runs orchestration after the response lifecycle. Use the exact same secret in the deployment environment and scheduler; never place it in a URL.

## Security and reliability

- Passwords are hashed with Argon2id using explicit memory, time, and parallelism costs.
- Session, verification, and recovery tokens are stored as hashes.
- Session cookies are HTTP-only, `SameSite=Lax`, and secure in production.
- Authentication and billing actions use rate limits and bounded request bodies.
- User and organization suspension revokes access at session resolution.
- Organization-owned records are authorization-scoped.
- URL validation permits only HTTP/HTTPS and blocks loopback, private, link-local, reserved, and cloud-metadata addresses after DNS resolution.
- Crawling respects `robots.txt`, uses bounded public fetches, and does not bypass protected content.
- Security headers include CSP, HSTS, frame denial, MIME sniffing protection, referrer policy, and a restrictive permissions policy.
- Cron and worker secrets use timing-safe comparisons.
- AI prompts are size-bounded, outputs are validated with Zod, and provider attempts are logged without storing raw prompts.
- Job claiming is concurrency-safe, stale jobs are recoverable, and individual stages retain progress and failure details.
- Stripe webhook signatures are verified and events are processed idempotently.
- Administrative changes and important product events are written to audit or usage logs.

## Quality checks

Run the full local verification suite before opening a pull request:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Database schema checks are available separately:

```bash
pnpm db:check
```

The test suite covers authentication, authorization boundaries, session invalidation, cron authentication, proxy behavior, SSRF protection, AI schemas and reliability, fit scoring, evidence handling, report email templates, and billing-plan definitions.

## Deployment

### Web application on Vercel

Configure the Vercel project with `apps/web` as its root directory. Add the production environment variables from `.env.example`, use the pooled PostgreSQL URL for application traffic, run migrations separately with the direct URL, and map the production domain through Vercel.

### Standalone worker

`render.yaml` contains an optional worker-service definition. Configure database, AI, worker secret, SMTP, PageSpeed, and observability variables in the hosting provider rather than committing them.

### Stripe

Create recurring prices for the Solo and Agency plans, set the two price IDs, and configure the Stripe webhook to deliver subscription, checkout, and invoice events to:

```text
https://your-domain.example/api/billing/webhook
```

Use Stripe test-mode keys and prices during development and preview deployments. Use live credentials only in the production environment.

## Responsible use

LeadLens is designed for legitimate research on public business websites. Generated findings may contain incomplete context or inference. Users should review evidence, respect website policies and applicable law, avoid sensitive or protected targets, and verify claims before using them in outreach or proposals.

## Project status

LeadLens is an actively developed private product. Interfaces, migrations, plan definitions, and provider configuration may change as the platform evolves.
