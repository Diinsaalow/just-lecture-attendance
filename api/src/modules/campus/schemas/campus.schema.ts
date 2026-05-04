import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { User } from '../../users/schemas/user.schema';

export type CampusDocument = HydratedDocument<Campus>;

@Schema({ timestamps: true })
export class Campus {
  @Prop({ required: true, trim: true })
  campusName: string;

  @Prop({ required: true, trim: true })
  telephone: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}

export const CampusSchema = SchemaFactory.createForClass(Campus);
