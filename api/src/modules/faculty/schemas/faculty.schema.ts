import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { Campus } from '../../campus/schemas/campus.schema';

export type FacultyDocument = HydratedDocument<Faculty>;

@Schema({ timestamps: true })
export class Faculty {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  code?: string;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Campus.name, required: true })
  campusId: Types.ObjectId;
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);
