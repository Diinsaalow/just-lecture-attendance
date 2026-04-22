# Module: Users

## Purpose

Persist **operator identities**: instructors, faculty admins, and super admins. Store **username** and **hashed numeric passcode** (FR-01, FR-02). Provide CRUD used by super admin (and scoped flows for faculty admin where product allows).

## Responsibilities

- Create/update/deactivate users.
- Enforce passcode rules: **6–9 digits**, numeric string (FR-02).
- Store **never** plaintext passcodes; use **bcrypt** or **argon2**.
- Assign **role** and **facultyId** (null for super admin; required for faculty admin and instructor per your policy).
- Expose repository/service methods for **Auth** (`findByUsername`, `validateCredentials`).

## Database model(s) / schema

### Collection: `users`

| Field | Type | Index | Notes |
|-------|------|-------|-------|
| `_id` | ObjectId | primary | |
| `username` | string | **unique** | Case normalization policy: recommend **lowercase** stored |
| `passcodeHash` | string | | |
| `role` | string enum | | `INSTRUCTOR` \| `FACULTY_ADMIN` \| `SUPER_ADMIN` |
| `facultyId` | ObjectId \| null | index | Required for `INSTRUCTOR` and `FACULTY_ADMIN` if using strict SRS scoping |
| `isActive` | boolean | | Default `true` |
| `createdAt` | Date | | |
| `updatedAt` | Date | | |

**Mongoose schema (illustrative):**

```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username: string;

  @Prop({ required: true })
  passcodeHash: string;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', default: null })
  facultyId: Types.ObjectId | null;

  @Prop({ default: true })
  isActive: boolean;
}
```

## Controller(s)

`UsersController` — base path: `api/v1/users` (all **JWT + role** protected).

| Action | Who |
|--------|-----|
| List/create/update/deactivate | `SUPER_ADMIN` |
| Optional: create instructor in own faculty | `FACULTY_ADMIN` (if product allows) |

## Service(s)

| Service | Methods (examples) |
|---------|---------------------|
| `UsersService` | `create(dto)`, `update(id, dto)`, `findById`, `findByUsername`, `setActive`, `hashPasscode`, `verifyPasscode` |

**Password flow:**

- On create/update: validate DTO passcode → `hash` → store `passcodeHash`.
- On login: delegated from Auth — `findByUsername` + `compare(passcode, passcodeHash)`.

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/users` | `SUPER_ADMIN` (+ optional `FACULTY_ADMIN`) | Create user |
| GET | `/users` | `SUPER_ADMIN` | Paginated list; filters: role, facultyId, isActive |
| GET | `/users/:id` | `SUPER_ADMIN` or self for limited fields | Detail |
| PATCH | `/users/:id` | `SUPER_ADMIN` | Update fields, passcode rotation |
| PATCH | `/users/:id/deactivate` | `SUPER_ADMIN` | Soft deactivate |

**Faculty admin variant (optional):**

- `GET /users/faculty/me/instructors` — list instructors where `facultyId` matches JWT claim.

## Validation rules (DTOs)

### `CreateUserDto`

| Field | Rules |
|-------|--------|
| `username` | `IsString`, `MinLength(3)`, `MaxLength(64)`, pattern safe for your ID policy |
| `passcode` | `Matches(/^\d{6,9}$/)` per FR-02 |
| `role` | `IsEnum(UserRole)` |
| `facultyId` | `IsMongoId`, `ValidateIf` required when role is not `SUPER_ADMIN` |

### `UpdateUserDto`

- Partial of above; passcode optional.

## Business logic

- **Role/faculty consistency:** If `role === SUPER_ADMIN`, `facultyId` must be `null`. If `FACULTY_ADMIN` or `INSTRUCTOR`, `facultyId` required.
- **Deactivate:** Set `isActive: false`; Auth should reject login for inactive users.
- **Username uniqueness:** Handle duplicate key error → 409.

## Relationships with other modules

- **Auth:** reads users for login.
- **Authorization:** JWT payload includes `sub`, `role`, `facultyId`.
- **Instructors:** `InstructorProfile.userId` references `User`.
- **Audit:** log user create/update/deactivate.

## Required permissions / access control

- `SUPER_ADMIN`: full user management.
- `FACULTY_ADMIN`: only if you expose scoped endpoints — **must** enforce `facultyId` match (same as JWT).
- `INSTRUCTOR`: no access to user admin endpoints.

## Important workflows

1. **Super admin creates faculty admin** with `facultyId` set.
2. **Super admin creates instructor** → later **Instructor profile** links same `userId`.

## Dependencies before implementing

- [module-platform-bootstrap.md](./module-platform-bootstrap.md) (MongoDB, validation).

## Implementation notes

- Consider **rate limiting** on login at Auth layer (not here) due to short numeric passcodes.
- Do not return `passcodeHash` in any API response.
