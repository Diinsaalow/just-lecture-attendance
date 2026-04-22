# Module: Campuses

## Purpose

Represent **physical/logical campuses** for JUST’s multi-campus environment (scope §5.1, §14). Campuses are the root of the organizational hierarchy: faculties belong to a campus; geofence and Wi‑Fi rules may be scoped at campus level.

## Responsibilities

- CRUD campuses (primarily **Super Admin**).
- Provide read endpoints for dashboards and for validating attendance context (optional: embed campus in session).
- Ensure stable **codes** or slugs for reporting filters.

## Database model(s) / schema

### Collection: `campuses`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `name` | string | |
| `code` | string | **unique** (e.g. `MAIN`, `NORTH`) |
| `timezone` | string | optional IANA e.g. `Africa/Mogadishu` — if per-campus local time needed |
| `location` | GeoJSON Point | optional default center for geofence inheritance |
| `isActive` | boolean | default true |
| `createdAt` / `updatedAt` | Date | timestamps |

**Mongoose (illustrative):**

```typescript
@Schema({ timestamps: true })
export class Campus {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop()
  timezone?: string;

  @Prop({ type: Object }) // or GeoJSON schema type
  location?: { type: 'Point'; coordinates: [number, number] };

  @Prop({ default: true })
  isActive: boolean;
}
```

## Controller(s)

`CampusesController` — `api/v1/campuses`

## Service(s)

| Service | Methods |
|---------|---------|
| `CampusesService` | `create`, `update`, `findAll`, `findById`, `findByCode`, `softDeactivate` |

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/campuses` | `SUPER_ADMIN`, `FACULTY_ADMIN` (read), `INSTRUCTOR` (read optional) | List active campuses |
| GET | `/campuses/:id` | Same read roles | Detail |
| POST | `/campuses` | `SUPER_ADMIN` | Create |
| PATCH | `/campuses/:id` | `SUPER_ADMIN` | Update |
| PATCH | `/campuses/:id/deactivate` | `SUPER_ADMIN` | Deactivate |

**Note:** If instructors do not need campus list in v1, restrict GET to admins only.

## Validation rules

### `CreateCampusDto` / `UpdateCampusDto`

| Field | Rules |
|-------|--------|
| `name` | `IsString`, `MinLength(2)`, `MaxLength(128)` |
| `code` | `IsString`, `Matches(/^[A-Z0-9_-]+$/)` or similar |
| `timezone` | `IsOptional`, `IsTimeZone` (custom or allowlist) |
| `location` | `IsOptional`, validate lat/lng |

## Business logic

- Prevent deleting campuses that still have active faculties (either **block** or **cascade** per product; recommend **block** with 409 and count).
- `code` immutable after create, or allow super admin only with migration caution.

## Relationships with other modules

- **Faculties:** `Faculty.campusId` references campus.
- **Geofence / Wi‑Fi:** optional `campusId` scope.
- **Sessions:** may denormalize `campusId` for query performance.
- **Audit:** campus create/update/deactivate.

## Required permissions / access control

- **Super Admin:** write.
- **Faculty Admin / Instructor:** read only if UI needs it; otherwise admin-only.

## Important workflows

1. Super admin creates campuses at system bootstrap.
2. Faculties are created under a campus.

## Dependencies before implementing

- [module-platform-bootstrap.md](./module-platform-bootstrap.md)
- [module-auth.md](./module-auth.md) + [module-authorization.md](./module-authorization.md)

## Implementation notes

- Add **2dsphere** index if using GeoJSON queries on campus location.
