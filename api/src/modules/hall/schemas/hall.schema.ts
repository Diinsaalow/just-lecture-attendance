import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { Campus } from '../../campus/schemas/campus.schema';
import { User } from '../../users/schemas/user.schema';

export type HallDocument = HydratedDocument<Hall>;

/** Teaching venue (lecture hall) under a campus. */
@Schema({ timestamps: true, collection: 'halls' })
export class Hall {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  code: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Campus',
    required: true,
    index: true,
  })
  campusId: Types.ObjectId;

  @Prop({ min: 0 })
  capacity?: number;

  /** GPS latitude of the hall centre (for geofence). */
  @Prop({ type: Number })
  latitude?: number;

  /** GPS longitude of the hall centre (for geofence). */
  @Prop({ type: Number })
  longitude?: number;

  /** Geofence radius in metres around the hall centre. */
  @Prop({ type: Number })
  geofenceRadiusMeters?: number;

  /** Physical QR code payload for fallback check-ins */
  @Prop({ type: String, unique: true, sparse: true })
  qrCodeToken?: string;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}

export const HallSchema = SchemaFactory.createForClass(Hall);
