# Module: Instructors (profile)

## Purpose

Attach **instructor-specific metadata** to a `User` with role `INSTRUCTOR`: employee reference, display name, contact, and linkage to **faculty** (and campus). Timetables and attendance resolve “instructor for current user” through this profile.

## Responsibilities

- Create/update instructor profile for a given `userId`.
- Ensure **one profile per instructor user** (unique `userId`).
- Provide lookup: `findByUserId`, `findById` for admin UIs.
- Optional: bulk list by `facultyId` for faculty admin management (FR: manage instructors in faculty).

## Database model(s) / schema

### Collection: `instructor_profiles`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `userId` | ObjectId ref User | **unique** |
| `facultyId` | ObjectId ref Faculty | indexed |
| `campusId` | ObjectId ref Campus | optional denormalized |
| `employeeId` | string | optional, unique within faculty if used |
| `fullName` | string | display |
| `phone` | string | optional |
| `email` | string | optional |
| `isActive` | boolean | default true |
| `createdAt` / `updatedAt` | Date | |

**Mongoose (illustrative):**

```typescript
@Schema({ timestamps: true })
export class InstructorProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true, index: true })
  facultyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campus', index: true })
  campusId?: Types.ObjectId;

  @Prop()
  employeeId?: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ default: true })
  isActive: boolean;
}

InstructorProfileSchema.index({ facultyId: 1, employeeId: 1 }, { unique: true, sparse: true });
```

## Controller(s)

`InstructorsController` — `api/v1/instructors`

## Service(s)

| Service | Methods |
|---------|---------|
| `InstructorsService` | `create`, `update`, `findByUserId`, `findById`, `listByFaculty`, `assertOwnProfile` |

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/instructors/me` | `INSTRUCTOR` | Returns profile for `jwt.sub` |
| GET | `/instructors` | `SUPER_ADMIN`, `FACULTY_ADMIN` | List; faculty admin scoped |
| GET | `/instructors/:id` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Detail |
| POST | `/instructors` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Create profile + link existing user |
| PATCH | `/instructors/:id` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Update |

**Alternative:** combine user creation + profile in one admin endpoint — then Users module orchestrates; still keep this schema.

## Validation rules

### `CreateInstructorProfileDto`

| Field | Rules |
|-------|--------|
| `userId` | `IsMongoId` |
| `facultyId` | `IsMongoId` |
| `fullName` | `IsString`, `MinLength(2)`, `MaxLength(200)` |
| `employeeId` | `IsOptional`, `IsString`, `MaxLength(64)` |
| `phone` / `email` | optional validators |

## Business logic

- On create: verify `userId` references a user with `role === INSTRUCTOR` and `user.facultyId === dto.facultyId` (consistency).
- **Faculty admin:** only create/update profiles where `facultyId === jwt.facultyId`.
- Deactivate profile sets `isActive: false`; optionally also deactivate user via Users module (coordinated use case).

## Relationships with other modules

- **Users:** `userId`, role consistency.
- **Faculties / Campuses:** scope.
- **Timetable:** sessions reference `instructorUserId` (typically same as `userId`).
- **Attendance / Absence:** instructor identity.

## Required permissions / access control

- **Instructor:** `GET /instructors/me` only (or full self read).
- **Faculty admin:** scoped CRUD.
- **Super admin:** global.

## Important workflows

1. Super admin creates `User` (instructor) + `InstructorProfile` in sequence or one transaction.
2. Mobile app calls `/instructors/me` after login for display name and faculty context.

## Dependencies before implementing

- [module-users.md](./module-users.md)
- [module-faculties.md](./module-faculties.md)
- [module-auth.md](./module-auth.md), [module-authorization.md](./module-authorization.md)

## Implementation notes

- Keep **`instructorUserId` on Session** equal to `User._id` for simplicity (not profile `_id`) to avoid extra joins in attendance hot path.
