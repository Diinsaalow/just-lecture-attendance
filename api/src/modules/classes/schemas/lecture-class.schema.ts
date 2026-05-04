import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { AcademicYear } from '../../academic-year/schemas/academic-year.schema';
import { Campus } from '../../campus/schemas/campus.schema';
import { Department } from '../../department/schemas/department.schema';
import { User } from '../../users/schemas/user.schema';

/** Scheduled cohort / section (named `LectureClass` because `Class` is reserved in TS). */
export type LectureClassDocument = HydratedDocument<LectureClass>;

@Schema({ timestamps: true, collection: 'classes' })
export class LectureClass {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: Department.name, required: true })
  departmentId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  mode: string;

  @Prop({ required: true, trim: true })
  shift: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Types.ObjectId, ref: Campus.name, required: true })
  campusId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  batchId: string;

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

export const LectureClassSchema = SchemaFactory.createForClass(LectureClass);
