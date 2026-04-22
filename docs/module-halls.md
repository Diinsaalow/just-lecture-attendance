# Module: Halls (classrooms)

## Purpose

Manage **classrooms/halls** used in timetables and attendance verification (hall QR fallback FR-11, FR-28). Halls belong to a **faculty** (adjust if JUST shares halls across faculties — then link to `campusId` instead and document the change).

## Responsibilities

- CRUD halls within a faculty.
- Expose hall details for timetable assignment and QR display/printing.
- Link to optional **default geofence** or inherit campus/faculty rules (policy in Geofence module).

## Database model(s) / schema

### Collection: `halls`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `facultyId` | ObjectId ref Faculty | required, indexed |
| `campusId` | ObjectId ref Campus | optional denormalized for faster scoped queries |
| `name` | string | |
| `code` | string | unique per faculty: **`{ facultyId: 1, code: 1 }` unique** |
| `building` | string | optional |
| `floor` | string | optional |
| `capacity` | number | optional |
| `qrKeyId` | string | optional identifier for QR generation/rotation |
| `isActive` | boolean | default true |
| `createdAt` / `updatedAt` | Date | |

**Mongoose (illustrative):**

```typescript
@Schema({ timestamps: true })
export class Hall {
  @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true, index: true })
  facultyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campus', index: true })
  campusId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, trim: true })
  code: string;

  @Prop()
  building?: string;

  @Prop()
  floor?: string;

  @Prop({ min: 0 })
  capacity?: number;

  @Prop()
  qrKeyId?: string;

  @Prop({ default: true })
  isActive: boolean;
}

HallSchema.index({ facultyId: 1, code: 1 }, { unique: true });
```

## Controller(s)

`HallsController` — `api/v1/halls`

## Service(s)

| Service | Methods |
|---------|---------|
| `HallsService` | `create`, `update`, `findAll`, `findById`, `findByFaculty`, `assertBelongsToFaculty` |

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/halls` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Query `facultyId`; **faculty admin** forced to own faculty |
| GET | `/halls/:id` | Same + `INSTRUCTOR` read optional | Detail |
| POST | `/halls` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Create; faculty admin: body `facultyId` must match JWT |
| PATCH | `/halls/:id` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Update scoped |
| PATCH | `/halls/:id/deactivate` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Deactivate |

## Validation rules

### `CreateHallDto` / `UpdateHallDto`

| Field | Rules |
|-------|--------|
| `facultyId` | `IsMongoId` (on create) |
| `name` | `IsString`, `MinLength(1)`, `MaxLength(128)` |
| `code` | `IsString`, `MaxLength(32)` |
| `campusId` | `IsOptional`, `IsMongoId` — if denormalized, must match faculty’s campus |

## Business logic

- On create: verify `facultyId` exists; optionally set `campusId` from parent faculty document.
- **Faculty admin** cannot create hall in another faculty (compare DTO `facultyId` to JWT).

## Relationships with other modules

- **Faculties:** parent scope.
- **Timetable sessions:** `session.hallId`.
- **Hall QR:** tokens bind to `hallId` (and optionally `qrKeyId` for rotation).
- **Geofence / Wi‑Fi:** may target `hallId` for fine-grained rules.

## Required permissions / access control

- **Super Admin:** all faculties.
- **Faculty Admin:** CRUD only for `hall.facultyId === jwt.facultyId`.
- **Instructor:** read-only if mobile needs hall name for UI (optional).

## Important workflows

1. Faculty admin creates halls before timetable upload assigns `hallId`.
2. Hall QR printed and placed in room; mobile scans as fallback.

## Dependencies before implementing

- [module-faculties.md](./module-faculties.md)
- [module-auth.md](./module-auth.md), [module-authorization.md](./module-authorization.md)

## Implementation notes

- If halls are **shared** across faculties, refactor to `campusId` + shared pool and reference from sessions — update SRS alignment in code comments.
