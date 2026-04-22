# Module: Faculties

## Purpose

Model **faculties** under a campus. Faculty is the primary **tenant boundary** for faculty admins (FR-47) and groups instructors, halls, sessions, and absence queues.

## Responsibilities

- CRUD faculties under a campus (**Super Admin**).
- Enforce `campusId` integrity on create.
- Support listing faculties for dashboards; faculty admins see **only their** faculty (or a single record matching JWT).

## Database model(s) / schema

### Collection: `faculties`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `campusId` | ObjectId ref Campus | compound with `code` |
| `name` | string | |
| `code` | string | unique per campus: compound **`{ campusId: 1, code: 1 }` unique** |
| `isActive` | boolean | default true |
| `createdAt` / `updatedAt` | Date | |

**Mongoose (illustrative):**

```typescript
@Schema({ timestamps: true })
export class Faculty {
  @Prop({ type: Types.ObjectId, ref: 'Campus', required: true, index: true })
  campusId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code: string;

  @Prop({ default: true })
  isActive: boolean;
}

FacultySchema.index({ campusId: 1, code: 1 }, { unique: true });
```

## Controller(s)

`FacultiesController` — `api/v1/faculties`

## Service(s)

| Service | Methods |
|---------|---------|
| `FacultiesService` | `create`, `update`, `findAll`, `findById`, `findByCampus`, `assertExists` |

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/faculties` | `SUPER_ADMIN`, `FACULTY_ADMIN`, `INSTRUCTOR` (optional) | List; **FACULTY_ADMIN** filtered to own `facultyId` |
| GET | `/faculties/:id` | Same | Detail; faculty admin must match id |
| POST | `/faculties` | `SUPER_ADMIN` | Create under `campusId` |
| PATCH | `/faculties/:id` | `SUPER_ADMIN` | Update |
| PATCH | `/faculties/:id/deactivate` | `SUPER_ADMIN` | Deactivate |

## Validation rules

### `CreateFacultyDto`

| Field | Rules |
|-------|--------|
| `campusId` | `IsMongoId` |
| `name` | `IsString`, `MinLength(2)`, `MaxLength(128)` |
| `code` | `IsString`, `MaxLength(32)` |

## Business logic

- On create, verify `campusId` exists and is active.
- Faculty admin **GET list**: if role is `FACULTY_ADMIN`, override filter to `{ _id: user.facultyId }` or return single-item array.
- Deactivate: block if policy requires zero active sessions (soft check) — product-specific.

## Relationships with other modules

- **Campuses:** parent.
- **Users:** `facultyId` on instructor/faculty admin.
- **Halls, Instructor profiles, Sessions, Absence:** all carry `facultyId`.
- **Authorization:** primary scope key.

## Required permissions / access control

- **Super Admin:** full write.
- **Faculty Admin:** read own faculty only; **no** create/delete campus-wide faculties unless you explicitly allow (SRS: manage instructors/halls in **their** faculty — not create new faculty).

## Important workflows

1. Super admin creates faculty after campus exists.
2. Users assigned to faculty receive `facultyId` in JWT.

## Dependencies before implementing

- [module-campuses.md](./module-campuses.md)
- [module-auth.md](./module-auth.md), [module-authorization.md](./module-authorization.md)

## Implementation notes

- Prefer **compound unique index** `(campusId, code)` over global unique `code` alone.
