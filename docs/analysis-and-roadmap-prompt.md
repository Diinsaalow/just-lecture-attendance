# Analysis and roadmap prompt (core features)

Use this prompt when asking a teammate, planner, or LLM to analyze the repository and propose next steps after foundation CRUD is in place.

## Context

We are building the **JUST Instructor Lecture Attendance** system. The repository is a monorepo:

- **just-lecture-attendance/api** — NestJS backend (MongoDB/Mongoose, global prefix `api/v1`, JWT auth after passcode login per docs).
- **just-lecture-attendance/admin** — React admin SPA (foundation CRUD: campuses, faculties, departments, academic years, semesters, periods, lecture classes, users, roles/settings, dashboard).
- **just-lecture-attendance/mobile** — Flutter client (intended for instructor-facing attendance flows per documentation).
- **just-lecture-attendance/docs** — Authoritative product/backend specifications: module list, implementation order, FR references, and data models (e.g. `module-attendance.md`, `module-absence.md`, `module-timetable-sessions.md`, validation stack Wi‑Fi/geofence/QR/devices).

## Current state (working assumption)

Core foundation domains are largely in place on the API and mirrored in the admin UI (organizational structure, academic structure, classes, users, auth, roles). The product-complete path still requires the session timeline, attendance pipeline, absence workflow, and downstream reporting/audit described in the docs and dependency graph in `backend-modules-overview.md`.

## Primary product goals

1. **Session attendance** — Record instructor check-in and check-out for scheduled class sessions, with server-side validation orchestration (timetable/session window, device binding, approved Wi‑Fi, geofence, optional hall QR), server timestamps, duplicate prevention, duration and status flags (e.g. late, left early, missing check-out), and faculty/admin capabilities where specified.

2. **Absence and related compliance** — Support absence requests, faculty (or delegated) decisions, linkage to sessions and attendance state (e.g. approved absence vs no-show), and any “late submission” or deadline semantics defined in `module-absence.md` and requirements docs — aligned with reporting needs.

## What we need from you

1. **Read and map the codebase** (not only the docs): trace what is implemented end-to-end for API routes, Mongoose schemas, guards/scoping, and admin/mobile surfaces versus what the docs define for modules roughly ordered as: timetable/sessions → hall QR → attendance → absence → reporting → audit.

2. **Deep analysis** — For each major area, summarize:
   - Data model coverage (collections, indexes, uniqueness rules such as one attendance row per instructor per session).
   - API surface (controllers/DTOs), error contracts, and authorization (role + faculty scoping).
   - Gaps vs `module-attendance.md` / `module-absence.md` (validation order, status flags, irregularities, admin checkout, cron vs on-read for missing check-out, etc.).
   - Client impact: which admin screens or mobile flows are missing, blocked, or stubbed.

3. **Step-by-step completion plan** — Produce an ordered roadmap that respects dependencies in `backend-modules-overview.md`, with concrete milestones (e.g. “Session model + CRUD + import”, “Attendance check-in/out with validation pipeline”, “Absence FSM + notifications if any”, “Reporting aggregations”, “Audit emitters”). Each step should state: deliverables, acceptance criteria tied to FR IDs or doc sections where possible, risks, and optional parallel work (e.g. admin read-only views while API stabilizes).

## Output format

- Executive summary (1 short paragraph).
- Current vs target matrix (module or feature × API / admin / mobile / docs).
- Ordered next steps with dependencies and clear “definition of done” per step.

## Rationale (why this prompt is shaped this way)

- It names the stack and paths so the reader knows where to look.
- It separates foundation from product pillars and ties pillars to existing module docs instead of vague “recording attendance.”
- It asks for evidence-based analysis (code + docs) and roadmap structure (dependencies, acceptance criteria) suitable for engineering or a planning agent.

## Short variant (single LLM pass)

Delete the “Output format” bullets and replace with one instruction: respond with executive summary, gap matrix, and ordered roadmap only.
