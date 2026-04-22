# Module: Audit

## Purpose

Persist an **append-only audit trail** for accountability ([SRS §16](JUST_instructor_attendance_requirements.md)): logins, check-in/out, admin checkout, absence actions, timetable uploads, and critical admin changes.

## Responsibilities

- Provide `AuditService.log(event)` callable from other modules.
- Store actor, action, entity reference, metadata, timestamp.
- Offer **admin read APIs** with filters (super admin; faculty admin limited if metadata includes faculty scope).

## Database model(s) / schema

### Collection: `audit_entries`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `occurredAt` | Date | indexed (desc) |
| `actorUserId` | ObjectId \| null | system jobs null |
| `actorRole` | string \| null | snapshot |
| `action` | string enum | see below |
| `entityType` | string | e.g. `Session`, `AttendanceRecord` |
| `entityId` | ObjectId \| null | |
| `facultyId` | ObjectId \| null | for scoped queries |
| `ip` | string \| optional | from request |
| `userAgent` | string \| optional | |
| `metadata` | object | free-form JSON (sanitized) |

**Actions (examples):**

- `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILURE` (optional)
- `ATTENDANCE_CHECK_IN`, `ATTENDANCE_CHECK_OUT`
- `ATTENDANCE_ADMIN_CHECKOUT`
- `ABSENCE_SUBMIT`, `ABSENCE_APPROVE`, `ABSENCE_REJECT`
- `TIMETABLE_IMPORT`, `SESSION_CREATE`, `SESSION_UPDATE`, `SESSION_DELETE`
- `USER_CREATE`, `USER_UPDATE`, `HALL_CREATE`, …

**Mongoose (illustrative):**

```typescript
@Schema()
export class AuditEntry {
  @Prop({ type: Date, required: true, index: true })
  occurredAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  actorUserId: Types.ObjectId | null;

  @Prop()
  actorRole?: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  entityType: string;

  @Prop({ type: Types.ObjectId, default: null })
  entityId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', default: null, index: true })
  facultyId: Types.ObjectId | null;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}
```

## Controller(s)

`AuditController` — `api/v1/audit`

## Service(s)

| Service | Methods |
|---------|---------|
| `AuditService` | `log({ action, entityType, entityId, facultyId, metadata, actor })` |
| `AuditQueryService` | `list(filters, pagination)` |

`log` should **never throw** to callers (wrap in try/catch internally) so business flow is not blocked; optionally push to queue later.

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/audit` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Paginated list; query: action, from, to, facultyId (super only), entityType |

**Faculty admin:** force `facultyId = jwt.facultyId` server-side.

## Validation rules

Query DTO:

| Param | Rules |
|-------|--------|
| `from`, `to` | ISO dates |
| `page`, `limit` | pagination caps |

## Business logic

- Redact sensitive metadata (never store passcodes or raw device fingerprints).
- Correlate `entityId` for drill-down in admin UI.

## Relationships with other modules

- **All modules** call `AuditService` at mutation points.

## Required permissions / access control

- Read: admins only.
- Write: internal service only (no public POST).

## Important workflows

1. On successful login → log success with `actorUserId`.
2. On admin checkout → log with target session + instructor ids in `metadata`.

## Dependencies before implementing

- [module-platform-bootstrap.md](./module-platform-bootstrap.md)
- [module-auth.md](./module-auth.md) (for actor context)

## Implementation notes

- Consider **TTL index** on `occurredAt` if retention policy requires auto-expiry (legal hold may forbid — product decision).
- For high volume, batch inserts or separate logging infrastructure later.
