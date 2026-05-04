import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { AcademicYear } from '../../academic-year/schemas/academic-year.schema';
import { User } from '../../users/schemas/user.schema';

export type SemesterDocument = HydratedDocument<Semester>;

@Schema({ timestamps: true })
export class Semester {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Types.ObjectId, ref: AcademicYear.name, required: true })
  academicYearId: Types.ObjectId;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}

export const SemesterSchema = SchemaFactory.createForClass(Semester);
