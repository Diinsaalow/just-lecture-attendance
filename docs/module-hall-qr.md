# Module: Hall QR

## Purpose

Provide **server-verifiable QR codes** for halls so instructors can use **hall scan fallback** when fingerprint is unavailable (FR-11, FR-28). Scanning decodes a payload the backend validates against the **hall** and the **session**’s expected hall when applicable.

## Responsibilities

- **Generate** signed QR payload for a hall (admin UI / batch generation).
- **Validate** scanned token during attendance: signature, expiry, `hallId` match to session’s `hallId` (FR-28).
- Optional: **rotate** signing key via `hall.qrKeyId` or global key versioning.

## Database model(s) / schema

No mandatory new collection if using **stateless signed JWT-style** tokens.

Optional: `qr_nonces` collection for one-time tokens (usually not needed for static hall QR).

### Stateless payload (recommended pattern)

Encode in QR string (e.g. base64url JSON) + HMAC or asymmetric sign:

```json
{
  "v": 1,
  "hallId": "...",
  "kid": "2026-04",
  "iat": 1710000000,
  "exp": 1730000000
}
```

Sign with `QR_SIGNING_SECRET` (HMAC-SHA256) or private key; verify with secret/public key.

## Controller(s)

`HallQrController` — `api/v1/hall-qr`

## Service(s)

| Service | Methods |
|---------|---------|
| `HallQrService` | `generateToken(hallId, ttlSeconds)`, `verifyToken(raw)`, `assertMatchesSession(session, verifiedPayload)` |

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/hall-qr/halls/:hallId/token` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Returns `{ qrPayload: string }` or URL for printing |
| POST | `/hall-qr/verify` | Internal or `INSTRUCTOR` | Usually **not** public — verification happens inside Attendance service |

**Alternative:** No HTTP verify endpoint; Attendance accepts `qrPayload` in check-in body and calls `HallQrService.verify` internally.

## Validation rules

### `GenerateHallQrDto` (optional body)

| Field | Rules |
|-------|--------|
| `expiresInSeconds` | `IsOptional`, `Min(3600)`, `Max(31536000)` |

### Check-in body field (in Attendance module)

| Field | Rules |
|-------|--------|
| `qrPayload` | `IsOptional`, `IsString` — required if `method === QR` |

## Business logic

1. **Generate:** Load hall; ensure hall active and admin has access to hall’s faculty.
2. **Verify signature** and `exp` > now.
3. **FR-28:** `payload.hallId` must equal `session.hallId` when session has `hallId` set. If session has no hall, policy: reject QR path or allow with warning — **recommend reject** for v1.
4. **Replay:** Static QR means replay is possible; mitigate with **short session binding** optional extension (not in SRS v1). Accept replay risk for static hall QR or rotate QR periodically via shortened `exp`.

## Relationships with other modules

- **Halls:** `hallId` in payload.
- **Sessions:** hall must match.
- **Attendance:** invokes verification on QR path.

## Required permissions / access control

- Generate token: **admin only** (scoped faculty admin).
- Verify: part of authenticated instructor check-in.

## Important workflows

1. Faculty admin generates QR for each hall; PDF posted in room.
2. Instructor selects session → check-in with `method=QR` + `qrPayload` + fingerprint skipped.

## Dependencies before implementing

- [module-halls.md](./module-halls.md)
- [module-auth.md](./module-auth.md), [module-authorization.md](./module-authorization.md)
- Config: `QR_SIGNING_SECRET`

## Implementation notes

- Use **constant-time** comparison for HMAC verify.
- Log verification failures with reason code for FR-29 / needs review.
