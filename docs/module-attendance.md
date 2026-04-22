# Module: Attendance

## Purpose

Implement **session-based check-in and check-out** (FR-09–FR-24), **validation** against timetable, device, Wi‑Fi, GPS, and QR (FR-12–FR-18, FR-25–FR-29), **server timestamps**, **duplicate prevention** (FR-18), **duration and status flags** (FR-30–FR-34), and **admin checkout on behalf** (FR-24).

## Responsibilities

- `checkIn`, `checkOut` for instructors.
- `adminCheckOut` for faculty admins (and super admin).
- Orchestrate validation pipeline in deterministic order; return structured error codes.
- Compute **late** (check-in > 30 min after scheduled start, FR-31) and **left early** (check-out > 1 hour before scheduled end, FR-32).
- Flag **missing check-out** when check-in exists without checkout past session end + grace (FR-23) — can be **cron/job** or computed at report time.
- Store **irregularities** for review (FR-29, FR-54).

## Database model(s) / schema

### Collection: `attendance_records`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `sessionId` | ObjectId | ref Session |
| `instructorUserId` | ObjectId | ref User |
| `facultyId` | ObjectId | denormalized |
| `checkInAt` | Date \| null | server time |
| `checkOutAt` | Date \| null | server time |
| `checkInMethod` | enum | `FINGERPRINT` \| `QR` |
| `checkOutMethod` | enum \| null | same |
| `boundDeviceId` | ObjectId \| null | ref BoundDevice |
| `checkInWifiSsid` | string \| null | observed |
| `checkOutWifiSsid` | string \| null | |
| `checkInGeo` | `{ lat, lng }` \| null | |
| `checkOutGeo` | `{ lat, lng }` \| null | |
| `scheduledStart` | Date | snapshot from session at check-in |
| `scheduledEnd` | Date | snapshot |
| `scheduledDurationMinutes` | number | snapshot |
| `actualDurationMinutes` | number \| null | set on checkout |
| `statusFlags` | string[] | e.g. `LATE`, `LEFT_EARLY`, `MISSING_CHECKOUT`, `NEEDS_REVIEW` |
| `irregularityReasons` | string[] | machine-readable codes |
| `adminCheckOutBy` | ObjectId \| null | user who performed admin checkout |
| `adminCheckOutAt` | Date \| null | |
| `createdAt` / `updatedAt` | Date | |

**Unique index:** `{ sessionId: 1, instructorUserId: 1 }` **unique** — one attendance document per instructor per session (FR-18).

**Mongoose (illustrative):**

```typescript
@Schema({ timestamps: true })
export class AttendanceRecord {
  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  instructorUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', required: true, index: true })
  facultyId: Types.ObjectId;

  @Prop({ type: Date, default: null })
  checkInAt: Date | null;

  @Prop({ type: Date, default: null })
  checkOutAt: Date | null;

  @Prop({ type: String, enum: ['FINGERPRINT', 'QR'] })
  checkInMethod?: 'FINGERPRINT' | 'QR';

  @Prop({ type: String, enum: ['FINGERPRINT', 'QR'] })
  checkOutMethod?: 'FINGERPRINT' | 'QR';

  @Prop({ type: Types.ObjectId, ref: 'BoundDevice', default: null })
  boundDeviceId: Types.ObjectId | null;

  @Prop()
  checkInWifiSsid?: string;

  @Prop()
  checkOutWifiSsid?: string;

  @Prop({ type: Object })
  checkInGeo?: { lat: number; lng: number };

  @Prop({ type: Object })
  checkOutGeo?: { lat: number; lng: number };

  @Prop({ required: true })
  scheduledStart: Date;

  @Prop({ required: true })
  scheduledEnd: Date;

  @Prop({ required: true })
  scheduledDurationMinutes: number;

  @Prop({ default: null })
  actualDurationMinutes: number | null;

  @Prop({ type: [String], default: [] })
  statusFlags: string[];

  @Prop({ type: [String], default: [] })
  irregularityReasons: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  adminCheckOutBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  adminCheckOutAt: Date | null;
}

AttendanceRecordSchema.index({ sessionId: 1, instructorUserId: 1 }, { unique: true });
```

## Controller(s)

`AttendanceController` — `api/v1/attendance`

## Service(s)

| Service | Responsibility |
|---------|------------------|
| `AttendanceService` | `checkIn(dto, user)`, `checkOut(dto, user)`, `adminCheckOut(dto, adminUser)` |
| `AttendanceValidationService` (private or separate) | Compose: session ownership, time window, absence state, device, wifi, geofence, QR |
| `AttendanceStatusCalculator` | Late / left early / duration |

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/attendance/check-in` | `INSTRUCTOR` | Body: sessionId, method, deviceFingerprint, wifiSsid, lat/lng, qrPayload? |
| POST | `/attendance/check-out` | `INSTRUCTOR` | Body: sessionId, same context fields |
| POST | `/attendance/admin/check-out` | `FACULTY_ADMIN`, `SUPER_ADMIN` | Body: sessionId, instructorUserId, note? |
| GET | `/attendance/me` | `INSTRUCTOR` | History with filters |
| GET | `/attendance` | admins scoped | List with filters |

## Validation rules

### `CheckInDto` / `CheckOutDto`

| Field | Rules |
|-------|--------|
| `sessionId` | `IsMongoId` |
| `method` | `IsEnum(['FINGERPRINT','QR'])` |
| `deviceFingerprint` | `IsString` — required for instructor path |
| `wifiSsid` | `IsString` — required per FR-15 (unless documented exception) |
| `latitude`, `longitude` | `IsNumber`, valid ranges |
| `qrPayload` | required if `method === QR` |

## Business logic (pipeline)

### Preconditions (both check-in and check-out)

1. Load **Session** by `sessionId`; 404 if missing.
2. If `session.status === CANCELLED` → reject.
3. **Ownership:** `session.instructorUserId.equals(jwt.sub)` (FR-12).
4. **Absence:** If approved absence exists for session → reject check-in/out (or allow checkout only — product: usually **no check-in** if approved absence covers session).

### Check-in only

5. **Duplicate:** If `AttendanceRecord` exists with `checkInAt` set → **409** (FR-18).
6. **Time window (FR-13, FR-27):** Define policy, e.g. allow check-in from `scheduledStart - 15min` to `scheduledEnd` (tune). Reject if now outside window.
7. **Device (FR-14):** `DevicesService.verify(userId, fingerprint)`.
8. **Wi‑Fi (FR-15):** `ApprovedWifiService.validateForSession(session, wifiSsid)`.
9. **GPS (FR-16):** `GeofenceService.validateLocationForSession(session, lat, lng)`.
10. **Method-specific:**
    - `FINGERPRINT`: client must have performed biometric locally; server treats method as declaration + device binding (FR-10).
    - `QR`: `HallQrService.verify` + match session hall (FR-11, FR-28).
11. **Server timestamp:** `checkInAt = new Date()` (FR-17).
12. **Late flag:** If `checkInAt > scheduledStart + 30 minutes` → add `LATE` (FR-31).
13. Upsert `AttendanceRecord` with snapshot fields; set `checkInMethod`, geo, wifi, `boundDeviceId`.

### Check-out only

14. Require existing record with `checkInAt` and **no** `checkOutAt`.
15. Re-run validations (FR-20): device, wifi, geo, session still valid; method rules mirror check-in or relax per product (document if checkout skips QR).
16. `checkOutAt = new Date()` (FR-21).
17. `actualDurationMinutes = round((checkOutAt - checkInAt) / 60000)` (FR-22, FR-30).
18. **Left early:** If `checkOutAt < scheduledEnd - 60 minutes` → `LEFT_EARLY` (FR-32).
19. Clear `MISSING_CHECKOUT` if was set.

### Admin check-out (FR-24)

20. Admin must be `FACULTY_ADMIN` with `session.facultyId === jwt.facultyId` or `SUPER_ADMIN`.
21. Set `checkOutAt`, `actualDurationMinutes`, `adminCheckOutBy`, `adminCheckOutAt`; optionally skip wifi/geo or require admin note — **document**; still set server time.
22. **Audit** distinct action type `ADMIN_CHECKOUT`.

### Missing check-out (FR-23)

- **Batch job:** For sessions where `now > scheduledEnd + grace` and attendance has `checkInAt` but no `checkOutAt`, set flag `MISSING_CHECKOUT` on record (or compute in reporting).

### Irregularities (FR-29)

- Push to `irregularityReasons` for any failed validation that was manually overridden (admin) or edge cases; for normal rejects, return error without persisting record.

## Relationships with other modules

- **Sessions:** primary FK.
- **Devices, Wi‑Fi, Geofence, Hall QR:** validation.
- **Absence:** approved requests affect eligibility.
- **Reporting:** aggregates this collection.
- **Audit:** check-in/out, admin checkout.

## Required permissions / access control

- Instructor: own sessions only.
- Faculty admin: admin checkout + list attendance for faculty.

## Important workflows

See [backend-modules-overview.md](./backend-modules-overview.md) request flow.

## Dependencies before implementing

- [module-timetable-sessions.md](./module-timetable-sessions.md)
- [module-devices.md](./module-devices.md)
- [module-approved-wifi.md](./module-approved-wifi.md)
- [module-geofence.md](./module-geofence.md)
- [module-hall-qr.md](./module-hall-qr.md)
- [module-absence.md](./module-absence.md) — for approved absence checks
- [module-audit.md](./module-audit.md)

## Implementation notes

- Target **< 3s** validation (NFR): parallelize independent IO (wifi rules fetch + geofence fetch) where safe.
- Use **transactions** if creating attendance + updating session counters (if any) atomically.
