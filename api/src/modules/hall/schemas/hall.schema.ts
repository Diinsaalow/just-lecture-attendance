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

  @Prop({ type: Types.ObjectId, ref: Campus.name, required: true })
  campusId: Types.ObjectId;

  @Prop({ trim: true })
  building?: string;

  @Prop({ trim: true })
  floor?: string;

  @Prop({ min: 0 })
  capacity?: number;

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
