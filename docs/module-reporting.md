# Module: Reporting

## Purpose

Provide **read-only aggregates** for dashboards: attendance by instructor/faculty/date range (FR-49), visibility into **approved absences** and **irregular** cases (FR-50), **monthly** reports (FR-51), **faculty summaries** (FR-52), **scheduled vs completed hours** (FR-53), and **exception logs** (FR-54). Advanced export formats deferred (FR-55).

## Responsibilities

- Expose HTTP endpoints returning **JSON** (CSV/PDF later).
- Build **Mongo aggregation pipelines** joining `sessions`, `attendance_records`, `absence_requests`, `users`, `instructor_profiles`.
- Enforce **faculty scope** for faculty admins; super admin unrestricted.

## Database model(s) / schema

No new collections required; optional **`report_snapshots`** or materialized views are out of scope for v1.

## Controller(s)

`ReportingController` — `api/v1/reports`

## Service(s)

| Service | Methods |
|---------|---------|
| `ReportingService` | `monthlyAttendance(facultyId?, year, month)`, `facultySummary(facultyId, from, to)`, `scheduledVsCompleted(filters)`, `exceptionLog(filters)`, `instructorDetail(instructorUserId, from, to)` |

Implementation detail: each method returns DTO with stable shape for future export.

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/reports/monthly` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Query: `year`, `month`, optional `facultyId` (ignored for faculty admin — use JWT) |
| GET | `/reports/faculty-summary` | `SUPER_ADMIN`, `FACULTY_ADMIN` | `from`, `to` |
| GET | `/reports/scheduled-vs-completed` | `SUPER_ADMIN`, `FACULTY_ADMIN` | `from`, `to`, optional instructor |
| GET | `/reports/exceptions` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Types: late, left_early, missing_checkout, unapproved_absence |
| GET | `/reports/instructors/:userId` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Detail; faculty admin must ensure instructor in faculty |

**Super admin** may pass `facultyId` filter; **faculty admin** always injects own `facultyId`.

## Validation rules (query DTOs)

| Param | Rules |
|-------|--------|
| `from`, `to` | ISO date; `to >= from`; max range e.g. 366 days |
| `year` | integer; `month` 1–12 |
| `facultyId` | `IsOptional`, `IsMongoId` — super admin only |

## Business logic

### Scheduled vs completed hours (FR-53)

For each session in range:

- `scheduledMinutes = session.scheduledDurationMinutes`
- `completedMinutes`:
  - If approved absence → treat as **0 completed** but **excused** (separate column).
  - Else if attendance has `checkInAt` and `checkOutAt` → `actualDurationMinutes`.
  - Else if only check-in → 0 completed + flag missing checkout.
  - Else if no attendance and no approved absence → 0 + unapproved absence.

### Exception log (FR-54)

Union of:

- `statusFlags` contains `LATE`, `LEFT_EARLY`, `MISSING_CHECKOUT`
- Sessions with no attendance and no approved absence past session end
- Rejected absence requests (optional listing)

### Monthly report (FR-51)

Group by instructor (and faculty): counts of sessions, completed, late, exceptions, approved absences.

### Performance

- Use **`allowDiskUse`** only if needed; prefer indexes on `facultyId`, `sessionDate`, `instructorUserId`.
- For large datasets, consider pagination on exception lists.

## Relationships with other modules

- Reads: **sessions**, **attendance_records**, **absence_requests**, **instructor_profiles**.
- **Authorization:** mandatory faculty filter.

## Required permissions / access control

- No instructor access to aggregate endpoints unless you add “self” reports later (`/reports/me`).

## Important workflows

1. Faculty admin opens dashboard → calls `/reports/faculty-summary?from&to`.
2. Super admin selects campus/faculty filters.

## Dependencies before implementing

- [module-attendance.md](./module-attendance.md)
- [module-absence.md](./module-absence.md)
- [module-timetable-sessions.md](./module-timetable-sessions.md)
- [module-instructors.md](./module-instructors.md)
- [module-authorization.md](./module-authorization.md)

## Implementation notes

- Return **explicit zeroes** and **metadata** (`generatedAt`, `timezone`) for client display.
- Align status vocabulary with [SRS §15](./JUST_instructor_attendance_requirements.md).
