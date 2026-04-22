# Module: Approved Wi‑Fi SSID

## Purpose

Store **allowed Wi‑Fi SSID values** for attendance validation (FR-15). During check-in/out, the client sends the **observed SSID**; the server matches it against active rules scoped by campus, faculty, or hall.

## Responsibilities

- CRUD for approved SSID records (**Super Admin**; optionally **Faculty Admin** for rules scoped only to their faculty if product allows).
- Provide internal method: `matches(observedSsid, context)` where `context` includes `campusId`, `facultyId`, `hallId` from the session.
- Support **multiple SSIDs** per scope and **activate/deactivate** without delete.

## Database model(s) / schema

### Collection: `approved_wifi_ssids`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `ssid` | string | indexed; not globally unique — uniqueness is per scope |
| `campusId` | ObjectId \| null | optional scope |
| `facultyId` | ObjectId \| null | optional scope |
| `hallId` | ObjectId \| null | optional finer scope |
| `priority` | number | higher wins when overlapping (optional) |
| `isActive` | boolean | default true |
| `note` | string | optional admin note |
| `createdAt` / `updatedAt` | Date | |

**Scope rule:** At least one of `campusId`, `facultyId`, `hallId` should be set OR use a single “global” document with all null if you allow institution-wide SSID (discouraged for multi-campus — prefer campus scope).

**Compound index suggestion:** `{ facultyId: 1, ssid: 1, isActive: 1 }` for common lookups.

**Mongoose (illustrative):**

```typescript
@Schema({ timestamps: true })
export class ApprovedWifiSsid {
  @Prop({ required: true, trim: true })
  ssid: string;

  @Prop({ type: Types.ObjectId, ref: 'Campus', default: null })
  campusId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', default: null })
  facultyId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Hall', default: null })
  hallId: Types.ObjectId | null;

  @Prop({ default: 0 })
  priority: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  note?: string;
}
```

## Controller(s)

`ApprovedWifiController` — `api/v1/approved-wifi` (or `api/v1/reference/wifi`)

## Service(s)

| Service | Methods |
|---------|---------|
| `ApprovedWifiService` | `create`, `update`, `list`, `findApplicableRules`, `validateForSession(session, observedSsid)` |

### Matching logic (business)

1. Normalize `observedSsid`: trim; optional case-insensitive compare (SSID case sensitivity is OS-dependent — **document** that client sends exact string; server compares case-sensitive or normalized per policy).
2. Load active rules where:
   - `hallId` matches session hall, OR
   - `facultyId` matches and `hallId` null, OR
   - `campusId` matches and faculty/hall null
3. If any rule’s `ssid === observed` (per normalization) → pass.
4. Else → fail validation (403/400 with code `WIFI_NOT_APPROVED`).

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/approved-wifi` | `SUPER_ADMIN`, `FACULTY_ADMIN` | List with filters; faculty admin scoped |
| POST | `/approved-wifi` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Create |
| PATCH | `/approved-wifi/:id` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Update |
| PATCH | `/approved-wifi/:id/deactivate` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Deactivate |

**Instructor** does not manage SSIDs.

## Validation rules

### `CreateApprovedWifiDto`

| Field | Rules |
|-------|--------|
| `ssid` | `IsString`, `MinLength(1)`, `MaxLength(64)` |
| `campusId` / `facultyId` / `hallId` | optional `IsMongoId`; validate **exactly one** scope level OR validated combination per product |
| `priority` | `IsOptional`, `IsInt` |

**Custom validator:** Ensure scope fields reference existing entities and faculty admin cannot set foreign `facultyId`.

## Business logic

- **Faculty admin:** only create rules with `facultyId === jwt.facultyId` (or halls under that faculty).
- Overlapping rules: use `priority` or most specific scope wins (hall > faculty > campus).

## Relationships with other modules

- **Campuses, Faculties, Halls:** foreign keys.
- **Attendance:** calls `validateForSession` during check-in/out.

## Required permissions / access control

- Admin-only for CRUD.
- No public endpoints.

## Important workflows

1. Super admin seeds campus Wi‑Fi SSIDs before go-live.
2. Check-in payload includes `wifiSsid` from device; server validates.

## Dependencies before implementing

- [module-campuses.md](./module-campuses.md), [module-faculties.md](./module-faculties.md), [module-halls.md](./module-halls.md)
- [module-auth.md](./module-auth.md), [module-authorization.md](./module-authorization.md)

## Implementation notes

- Mobile OS may expose SSID only on certain versions — document client behavior; backend still enforces when field present (FR-15).
