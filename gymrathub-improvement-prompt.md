# GymRatHub — Phased Improvement Prompt (for Claude Code)

Use each phase as a separate prompt/session. Don't run all phases in one go — review and commit after each phase before moving to the next.

---

## Phase 0 — Audit (run this first, always)

```
Audit the GymRatHub repo (Next.js 15 frontend + Express/TS backend + MongoDB).
Before making changes, produce a short report covering:
1. Current test coverage (if any) and CI setup
2. Error handling gaps in API routes and React components
3. Any missing env validation, exposed secrets, or unhandled auth edge cases
4. Database schema review: indexes, missing validation, N+1 risks
5. Bundle size / performance red flags in the Next.js app
Do not fix anything yet — just report findings so we can prioritize.
```

---

## Phase 1 — Foundation Hardening

```
Harden GymRatHub's foundation before adding features:
1. Add Zod-based environment variable validation on both frontend and backend startup
2. Add Vitest + React Testing Library for frontend, Jest or Vitest for backend; write
   tests for the auth middleware, workout CRUD routes, and macro calculator logic
3. Add Playwright for one critical e2e flow: sign up -> create workout -> log a session
4. Set up GitHub Actions CI: lint, typecheck, test on every PR
5. Add Sentry (or similar) for error tracking on both frontend and backend
6. Add structured logging (pino) to the Express backend, replacing console.log
7. Dockerize both services with a docker-compose.yml for local dev (include a
   MongoDB container so contributors don't need Atlas to develop locally)
Keep changes incremental and don't touch existing feature logic.
```

---

## Phase 2 — Complete the Core Feature Set

```
GymRatHub currently has workout planning, nutrition tracking, and analytics but is
missing standard features users expect from a serious fitness app. Implement:
1. Stripe integration for the existing Free/Pro/Elite tiers (checkout, webhook
   handling, subscription status synced to the User model)
2. Rest timer + superset/drop-set support in the session builder
3. Email notifications (Resend or SendGrid) for workout reminders and streak-at-risk
   alerts, sent via a background job queue (BullMQ + Redis)
4. PWA support (offline caching of the current workout plan, installable manifest)
5. Progress photo upload with a before/after comparison slider component
6. CSV/PDF export of a user's workout history and body metrics
Build each as a separate, testable module. Add tests for the Stripe webhook handler
and the notification scheduler specifically, since those are the highest-risk pieces.
```

---

## Phase 3 — Differentiating Features (pick 1-2, not all)

```
Add ONE of the following as GymRatHub's signature feature — something competitors
like Hevy or Strong don't offer well. Propose an implementation plan first, including
data model changes, before writing code:

Option A — Adaptive programming: analyze a user's logged sets/reps/weight over time
to auto-suggest next session's targets, detect plateaus, and recommend deload weeks.

Option B — Recovery/readiness score: combine self-reported sleep, soreness, and
recent training load (volume/intensity) into a daily readiness score shown on the
dashboard, with a plain-language recommendation (push / maintain / recover).

Option C — Hands-free workout mode: a dedicated in-workout UI using the Web Speech
API for voice-logged sets and voice-controlled rest timers, for use mid-set.

Wait for my confirmation on which option before implementing.
```

---

## Phase 4 — Scale & Polish

```
Prepare GymRatHub for real users and future contributors:
1. Add Redis caching for the exercise library and YouTube API responses
   (rate-limit-sensitive) with a sensible TTL and cache-invalidation strategy
2. Add pagination and proper MongoDB indexes to workout, meal, and leaderboard
   queries; audit for N+1 query patterns
3. Generate OpenAPI/Swagger docs for the Express API
4. Add a Storybook instance documenting the shared component library
5. Run an accessibility pass (axe-core) on the dashboard and landing pages, fix
   WCAG AA violations
6. Add basic i18n scaffolding (next-intl) even if only English is populated for now,
   so the app is structured for future languages
7. Consider migrating to a Turborepo setup given the existing frontend/backend split,
   to speed up CI and enable shared type packages between them
```

---

### Notes for using this
- Run phases in order; each assumes the previous is merged and stable.
- After Phase 0's audit, re-prioritize Phases 1-4 based on what it actually finds —
  don't blindly follow this order if the audit surfaces a critical issue.
- In Phase 3, resist doing all three options — one well-built differentiator beats
  three shallow ones, and it's what will make GymRatHub memorable in a portfolio or demo.
