# Module: Platform bootstrap

## Purpose

Provide the **cross-cutting foundation** for the NestJS API: configuration, MongoDB connectivity, request validation, consistent error shaping, and health checks. Every other module assumes this layer is in place.

## Responsibilities

- Load and validate **environment variables** (`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `QR_SIGNING_SECRET`, `PORT`, optional `CORS_ORIGINS`).
- Register **Mongoose** with the application.
- Apply **global `ValidationPipe`** (whitelist, forbid non-whitelisted, transform).
- Expose **health** endpoints for orchestration (Mongo ping).
- Optionally register **global exception filter** for uniform JSON errors (useful for Flutter/React clients).
- Enable **CORS** for known dashboard origins when implementing the web app (can start permissive in dev).

## Database model(s) / schema

No domain collections. This module does not own Mongoose schemas.

## Package dependencies (npm/pnpm)

Add when implementing:

- `@nestjs/config`
- `@nestjs/mongoose`
- `mongoose`
- `class-validator`
- `class-transformer`
- `@nestjs/terminus` (optional, for `HealthCheckService`)

## NestJS structure

### Suggested files

```
src/
  app.module.ts                 # imports ConfigModule, MongooseModule, TerminusModule
  main.ts                       # bootstrap: globalPrefix already api/v1; ValidationPipe; CORS
  common/
    filters/
      http-exception.filter.ts  # optional
    pipes/                      # optional custom pipes
```

### `AppModule` (conceptual)

- `ConfigModule.forRoot({ isGlobal: true, validationSchema or validate() })`
- `MongooseModule.forRootAsync` reading `ConfigService.get('MONGODB_URI')`
- `TerminusModule` + `HealthModule` if used

## Controller(s)

| Controller | Path | Role |
|------------|------|------|
| `HealthController` | `GET /health` or `GET /health/live`, `GET /health/ready` | Public (no JWT) |

**Example routes:**

- `GET api/v1/health` — liveness.
- `GET api/v1/health/ready` — MongoDB ping via Terminus.

## Service(s)

| Service | Responsibility |
|---------|----------------|
| None required for minimal bootstrap | Health checks can use `MongooseHealthIndicator` from `@nestjs/terminus` |

Optional: `AppConfigService` wrapping `ConfigService` with typed getters.

## Routes / endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/health` | Public | Basic alive |
| GET | `/api/v1/health/ready` | Public | DB connectivity |

**Note:** Lock down or hide health in production if your ops policy requires it (e.g. internal network only).

## Validation rules

- **Env:** Fail fast on startup if `MONGODB_URI` or `JWT_SECRET` missing (when auth is added).
- **DTOs:** Global `ValidationPipe` with:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`

## Business logic

None (infrastructure only).

## Relationships with other modules

- **All modules** depend on Mongoose registration from here.
- **Auth** depends on `JWT_*` from config.

## Required permissions / access control

Health endpoints: **public**. All other routes remain protected by `JwtAuthGuard` once Auth is added.

## Important workflows

1. **Startup:** Load config → connect Mongo → listen on `PORT`.
2. **Deploy probe:** Orchestrator hits `/health/ready` before sending traffic.

## Dependencies before implementing

None (first module).

## Implementation notes

- Keep [main.ts](../api/src/main.ts) global prefix `api/v1` as already set.
- Use **UTC** for all stored instants; document campus timezone policy in Timetable/Attendance modules.
