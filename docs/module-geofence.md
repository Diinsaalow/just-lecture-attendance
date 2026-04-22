# Module: Geofence

## Purpose

Define **GPS boundaries** for validating instructor location during check-in/out (FR-16). Rules are scoped to campus, faculty, and/or hall with a defined geometry (circle or polygon).

## Responsibilities

- CRUD geofence rules (**Super Admin**; **Faculty Admin** for scoped rules if allowed).
- Expose `contains(lat, lng, sessionContext)` for the attendance engine.
- Support multiple rules with precedence (most specific scope wins).

## Database model(s) / schema

### Collection: `geofence_rules`

| Field | Type | Index |
|-------|------|-------|
| `_id` | ObjectId | primary |
| `name` | string | |
| `type` | enum | `CIRCLE` \| `POLYGON` |
| `center` | { lat: number, lng: number } | for `CIRCLE` |
| `radiusMeters` | number | for `CIRCLE` |
| `polygon` | array of `{ lat, lng }` | for `POLYGON` (closed ring or open with implied closure) |
| `campusId` | ObjectId \| null | scope |
| `facultyId` | ObjectId \| null | scope |
| `hallId` | ObjectId \| null | scope |
| `priority` | number | default 0 |
| `isActive` | boolean | default true |
| `createdAt` / `updatedAt` | Date | |

**2dsphere:** Store as GeoJSON for Mongo geospatial queries:

- Circle approximation: use `$centerSphere` in query or precompute polygon; Mongo does not natively store circle — common pattern is **center + radius** with `$geoWithin` + `$centerSphere` in aggregation or use polygon with N-gon approximation.

**Mongoose (illustrative — polygon as GeoJSON):**

```typescript
@Schema({ timestamps: true })
export class GeofenceRule {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ['CIRCLE', 'POLYGON'], required: true })
  type: 'CIRCLE' | 'POLYGON';

  // For POLYGON: GeoJSON stored in `boundary`
  @Prop({
    type: {
      type: String,
      enum: ['Polygon'],
      required: false,
    },
    coordinates: [[[Number]]],
  })
  boundary?: { type: 'Polygon'; coordinates: number[][][] };

  @Prop({ type: Object })
  center?: { lat: number; lng: number };

  @Prop()
  radiusMeters?: number;

  @Prop({ type: Types.ObjectId, ref: 'Campus', default: null })
  campusId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Faculty', default: null })
  facultyId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Hall', default: null })
  hallId: Types.ObjectId | null;

  @Prop({ default: 0 })
  priority: number;

  @Prop({ default: true })
  isActive: boolean;
}

GeofenceRuleSchema.index({ boundary: '2dsphere' });
```

**Implementation choice:** For `CIRCLE`, either:

- Store `center` + `radiusMeters` and use haversine check in application code, or
- Convert to GeoJSON Polygon and use `2dsphere`.

## Controller(s)

`GeofenceController` — `api/v1/geofences`

## Service(s)

| Service | Methods |
|---------|---------|
| `GeofenceService` | `create`, `update`, `list`, `findApplicableRules`, `validateLocationForSession(session, lat, lng)` |

### Location validation logic

1. Parse `lat`, `lng` as numbers; reject missing GPS (FR-16 implies required when policy says so).
2. Select active rules matching session scope (hall > faculty > campus).
3. If **any** applicable rule contains the point → pass.
4. If no rules configured for scope → product decision: **fail closed** (safer) or **fail open** (document risk). Recommend **fail closed** for integrity.

**Point-in-polygon:** Use turf.js server-side or Mongo `$geoIntersects` / `$geoWithin`.

**Circle:** Haversine distance `<= radiusMeters`.

## Routes / endpoints

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/geofences` | `SUPER_ADMIN`, `FACULTY_ADMIN` | List |
| POST | `/geofences` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Create |
| GET | `/geofences/:id` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Detail |
| PATCH | `/geofences/:id` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Update |
| PATCH | `/geofences/:id/deactivate` | `SUPER_ADMIN`, `FACULTY_ADMIN` | Deactivate |

## Validation rules

### `CreateGeofenceDto`

| Field | Rules |
|-------|--------|
| `name` | `IsString` |
| `type` | `IsEnum` |
| `center` | required if CIRCLE — `ValidateNested`, lat `[-90,90]`, lng `[-180,180]` |
| `radiusMeters` | required if CIRCLE — `Min(10)`, `Max(5000)` example bounds |
| `polygon` | required if POLYGON — min 3 vertices |
| Scope IDs | optional `IsMongoId` with cross-field validation |

## Business logic

- Faculty admin cannot attach rule to another faculty’s hall.
- Validate polygon orientation (GeoJSON uses lng,lat order — **be consistent**).

## Relationships with other modules

- **Campuses, Faculties, Halls** — scope.
- **Attendance** — calls validation on each check-in/out.

## Required permissions / access control

- Admin-only CRUD.

## Important workflows

1. Admin defines campus boundary; optional hall override for tighter check.
2. Mobile sends `latitude`, `longitude` with attendance request.

## Dependencies before implementing

- Organization modules for FK integrity
- [module-auth.md](./module-auth.md), [module-authorization.md](./module-authorization.md)

## Implementation notes

- GPS spoofing is out of scope for v1; still record coordinates for audit (FR-29 / needs review if implausible jumps).
