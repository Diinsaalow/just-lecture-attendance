import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { Faculty } from '../../faculty/schemas/faculty.schema';
import { User } from '../../users/schemas/user.schema';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  graduationName: string;

  @Prop({ type: Types.ObjectId, ref: Faculty.name, required: true })
  facultyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  duration: string;

  @Prop({ required: true, trim: true })
  abbreviation: string;

  @Prop({ required: true, trim: true })
  degree: string;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
