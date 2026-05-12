import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttendanceSettingsDocument = HydratedDocument<AttendanceSettings>;

/** Constant that identifies the singleton row. The unique index guarantees only one. */
export const ATTENDANCE_SETTINGS_SINGLETON_KEY = 'global';

/**
 * Singleton document storing attendance configuration.
 * Admins must configure all thresholds — no hardcoded defaults.
 */
@Schema({ timestamps: true, collection: 'attendance_settings' })
export class AttendanceSettings {
  /**
   * Hard-coded discriminator (always `'global'`). Backed by a unique index so
   * the database itself prevents the creation of multiple settings rows.
   */
  @Prop({
    type: String,
    required: true,
    unique: true,
    default: ATTENDANCE_SETTINGS_SINGLETON_KEY,
  })
  singletonKey: string;

  /** Minutes after scheduled start before a check-in is flagged as LATE. */
  @Prop({ type: Number, required: true })
  lateThresholdMinutes: number;

  /** Minutes before scheduled end; check-out earlier is flagged EARLY_CHECKOUT. */
  @Prop({ type: Number, required: true })
  earlyCheckoutThresholdMinutes: number;

  /** Minutes before scheduled start that check-in is allowed. */
  @Prop({ type: Number, required: true })
  checkInWindowBeforeMinutes: number;

  /**
   * Minutes after scheduled end that check-in is still accepted.
   * 0 = check-in only allowed until session end time.
   */
  @Prop({ type: Number, required: true })
  checkInWindowAfterMinutes: number;

  /** Grace period (minutes) after session end for check-out. */
  @Prop({ type: Number, required: true })
  checkOutGracePeriodMinutes: number;

  /** Whether GPS geofence validation is enforced. */
  @Prop({ type: Boolean, required: true })
  geofenceEnabled: boolean;

  /** Whether device ID validation is enforced. */
  @Prop({ type: Boolean, required: true })
  deviceValidationEnabled: boolean;

  /** Whether QR code fallback is available. */
  @Prop({ type: Boolean, required: true })
  qrCodeEnabled: boolean;
}

export const AttendanceSettingsSchema =
  SchemaFactory.createForClass(AttendanceSettings);
