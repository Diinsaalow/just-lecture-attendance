# Module: Devices (binding)

## Purpose

Register and verify **instructor mobile devices** used for attendance (FR-14). Only bound, non-revoked devices may perform check-in/out.

## Responsibilities

- **Register** device for authenticated instructor: store fingerprint / device id.
- **Revoke** devices (admin or self-service per product).
- **Verify** device on attendance requests.
- Optional: limit **N active devices** per instructor (e.g. 1 or 2).

## Database model(s) / schema

### Collection: `bound_devices`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `userId` | ObjectId ref User | indexed |
| `deviceIdHash` | string | **hashed** device fingerprint from client |
| `platform` | enum | `ANDROID` \| `IOS` |
| `model` | string | optional |
| `appVersion` | string | optional |
| `registeredAt` | Date | |
| `lastSeenAt` | Date | |
| `isRevoked` | boolean | default false |

**Unique constraint:** `{ userId: 1, deviceIdHash: 1 }` unique — allows multiple devices per user if policy uses different fingerprints; if **one device only**, enforce in service before insert.

**Mongoose (illustrative):**

```typescript
@Schema({ timestamps: true })
export class BoundDevice {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  deviceIdHash: string;

  @Prop({ type: String, enum: ['ANDROID', 'IOS'], required: true })
  platform: 'ANDROID' | 'IOS';

  @Prop()
  model?: string;

  @Prop()
  appVersion?: string;

  @Prop()
  lastSeenAt?: Date;

  @Prop({ default: false })
  isRevoked: boolean;
}

BoundDeviceSchema.index({ userId: 1, deviceIdHash: 1 }, { unique: true });
```

**Hashing:** Client sends `deviceFingerprint` (opaque string). Server computes `hash = sha256(secret + fingerprint + userId)` or bcrypt with fixed salt per env — **do not store raw fingerprint** if treated as secret.

## Controller(s)

`DevicesController` — `api/v1/devices`

## Service(s)

| Service | Methods |
|---------|---------|
| `DevicesService` | `register(userId, dto)`, `revoke(deviceId, actor)`, `verify(userId, rawFingerprint)`, `listForUser`, `listForAdminByFaculty` |

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/devices/register` | `INSTRUCTOR` | Bind device to `jwt.sub` |
| GET | `/devices/me` | `INSTRUCTOR` | List own devices |
| POST | `/devices/:id/revoke` | `INSTRUCTOR` (own), `SUPER_ADMIN`, `FACULTY_ADMIN` | Revoke |
| GET | `/devices` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Admin list by faculty/instructor |

## Validation rules

### `RegisterDeviceDto`

| Field | Rules |
|-------|--------|
| `deviceFingerprint` | `IsString`, `MinLength(16)`, `MaxLength(512)` |
| `platform` | `IsEnum` |
| `model` | `IsOptional`, `IsString` |
| `appVersion` | `IsOptional`, `IsString` |

## Business logic

1. **Register:** Hash fingerprint; if unique index conflict → idempotent return or 409 (choose: **return existing** for same user+device).
2. **Verify (Attendance):** Find document by `userId` + `deviceIdHash`; `!isRevoked`.
3. **Revoke:** Set `isRevoked: true`; audit the actor.
4. **Faculty admin list:** Only devices for instructors in `jwt.facultyId` (join via instructor profile or user `facultyId`).

## Relationships with other modules

- **Users:** `userId`.
- **Attendance:** requires valid `boundDeviceId` or embedded device reference in attendance record.
- **Audit:** register/revoke events.

## Required permissions / access control

- Instructors manage own devices; admins can revoke for support.

## Important workflows

1. After first login, app calls `POST /devices/register`.
2. Check-in includes same raw fingerprint → server hashes and matches.

## Dependencies before implementing

- [module-users.md](./module-users.md)
- [module-auth.md](./module-auth.md), [module-authorization.md](./module-authorization.md)

## Implementation notes

- Flutter device IDs can change on reinstall — document re-registration flow for instructors.
