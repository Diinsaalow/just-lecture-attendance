# Module: Authorization (RBAC + faculty scope)

## Purpose

Enforce **role-based access control** (FR-04) and **faculty data isolation** (FR-47): faculty admins must only access data for their faculty; super admins are global (FR-48).

## Responsibilities

- **`RolesGuard`:** Ensure route handler allowed roles match JWT `role`.
- **`FacultyScopeGuard` / interceptor:** For `FACULTY_ADMIN`, force queries and mutations to use JWT `facultyId`; reject body/query `facultyId` that does not match.
- **Decorators:** `@Roles(...)`, `@CurrentUser()` to read `req.user`.
- **Helpers:** `assertFacultyAccess(user, resourceFacultyId)` throwing `ForbiddenException`.

This module is often **no separate Mongoose schema** — only guards, decorators, and utilities. Optionally a thin `AuthorizationModule` exporting guards.

## Database model(s) / schema

None.

## Controller(s)

None (cross-cutting). Apply guards on feature controllers.

## Service(s)

| Service | Responsibility |
|---------|----------------|
| `AuthorizationService` (optional) | `canAccessFaculty(user, facultyId)`, `ensureSuperAdmin(user)` |

## Routes / endpoints

N/A.

## Validation rules

N/A at HTTP layer; **business rule:** every repository method for faculty-scoped entities accepts `actingUser` or `facultyId` filter injected from JWT.

## Business logic

### Role matrix (high level)

| Capability | INSTRUCTOR | FACULTY_ADMIN | SUPER_ADMIN |
|------------|------------|---------------|-------------|
| Own timetable / attendance | Yes | N/A | N/A |
| Manage users globally | No | No* | Yes |
| Manage halls/sessions in faculty | No | Yes (scoped) | Yes |
| Approve absence in faculty | No | Yes (scoped) | Yes |
| Institution reports | No | Faculty only | Yes |

*Unless you add scoped instructor creation.

### Faculty scoping rules

- **`FACULTY_ADMIN`:** Any `GET/PATCH/DELETE` that loads a document with `facultyId` must verify `document.facultyId === user.facultyId`.
- **`INSTRUCTOR`:** May only access resources where `instructorUserId === user.sub` or session assigned to that instructor (enforced in each service).
- **`SUPER_ADMIN`:** No faculty filter unless explicitly filtering for reports.

### Super admin `facultyId`

JWT should carry `facultyId: null` for super admin; guards treat null as bypass for scope checks.

## Relationships with other modules

- **All domain modules** import/use these guards.
- **Users:** roles and `facultyId` originate from user document.

## Required permissions / access control

Implementation pattern:

```typescript
@Roles(UserRole.FACULTY_ADMIN, UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Patch('sessions/:id')
```

Combine with explicit **service-level** checks for resource ownership.

## Important workflows

1. Faculty admin lists sessions → repository adds `{ facultyId: jwt.facultyId }`.
2. Faculty admin tries `GET /sessions/:id` for another faculty → **403**.

## Dependencies before implementing

- [module-auth.md](./module-auth.md) (JWT must populate `req.user`).

## Implementation notes

- **Do not trust** client-supplied `facultyId` for authorization; trust JWT and verify resource match.
- For **MongoDB ObjectId** comparisons, use `.equals()` or string normalize consistently.
- Consider **CASL** only if rules become complex; three roles usually suffice with explicit checks.
