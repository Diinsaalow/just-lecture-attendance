import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ClassSession } from '../../class-session/schemas/class-session.schema';
import { Faculty } from '../../faculty/schemas/faculty.schema';
import { Campus } from '../../campus/schemas/campus.schema';
import { Hall } from '../../hall/schemas/hall.schema';
import { AttendanceStatus } from '../enums/attendance-status.enum';
import { CheckInMethod } from '../enums/check-in-method.enum';

export type AttendanceRecordDocument = HydratedDocument<AttendanceRecord>;

@Schema({ timestamps: true, collection: 'attendance_records' })
export class AttendanceRecord {
  @Prop({ type: Types.ObjectId, ref: ClassSession.name, required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  instructorUserId: Types.ObjectId;

  /** Denormalized for scoped queries. */
  @Prop({
    type: Types.ObjectId,
    ref: Faculty.name,
    required: true,
    index: true,
  })
  facultyId: Types.ObjectId;

  /** Denormalized for scoped queries. */
  @Prop({ type: Types.ObjectId, ref: Campus.name, required: true })
  campusId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Hall.name })
  hallId?: Types.ObjectId;

  /* ── Check-in fields ── */

  @Prop({ type: Date, default: null })
  checkInAt: Date | null;

  @Prop({ type: String, enum: CheckInMethod })
  checkInMethod?: CheckInMethod;

  @Prop({ type: Object })
  checkInGeo?: { lat: number; lng: number };

  @Prop({ type: String })
  checkInDeviceId?: string;

  /* ── Check-out fields ── */

  @Prop({ type: Date, default: null })
  checkOutAt: Date | null;

  @Prop({ type: String, enum: CheckInMethod })
  checkOutMethod?: CheckInMethod;

  @Prop({ type: Object })
  checkOutGeo?: { lat: number; lng: number };

  @Prop({ type: String })
  checkOutDeviceId?: string;

  /* ── Schedule snapshots ── */

  @Prop({ type: Date, required: true })
  scheduledDate: Date;

  /** Time string snapshot, e.g. "08:00" */
  @Prop({ required: true })
  scheduledStart: string;

  /** Time string snapshot, e.g. "10:00" */
  @Prop({ required: true })
  scheduledEnd: string;

  /* ── Computed fields ── */

  /** Actual teaching minutes (set on check-out). */
  @Prop({ type: Number, default: null })
  actualDurationMinutes: number | null;

  @Prop({
    type: String,
    enum: AttendanceStatus,
    default: AttendanceStatus.CHECKED_IN,
  })
  status: AttendanceStatus;

  /** Machine-readable flags: LATE, EARLY_CHECKOUT, etc. */
  @Prop({ type: [String], default: [] })
  statusFlags: string[];

  /** Machine-readable irregularity codes for admin review. */
  @Prop({ type: [String], default: [] })
  irregularityReasons: string[];

  /* ── Admin check-out ── */

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  adminCheckOutBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  adminCheckOutAt: Date | null;

  @Prop({ type: String })
  adminCheckOutNote?: string;
}

export const AttendanceRecordSchema =
  SchemaFactory.createForClass(AttendanceRecord);

/** One attendance document per instructor per session. */
AttendanceRecordSchema.index(
  { sessionId: 1, instructorUserId: 1 },
  { unique: true },
);
AttendanceRecordSchema.index({ facultyId: 1, scheduledDate: -1 });
AttendanceRecordSchema.index({ instructorUserId: 1, scheduledDate: -1 });
