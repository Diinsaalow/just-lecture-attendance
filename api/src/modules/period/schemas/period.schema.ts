import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { Hall } from '../../hall/schemas/hall.schema';
import { Course } from '../../course/schemas/course.schema';
import { LectureClass } from '../../classes/schemas/lecture-class.schema';
import { Semester } from '../../semester/schemas/semester.schema';
import { User } from '../../users/schemas/user.schema';
import { TimetablePeriodType } from '../enums/timetable-period-type.enum';

export type PeriodDocument = HydratedDocument<Period>;

@Schema({ timestamps: true })
export class Period {
  @Prop({ type: Types.ObjectId, ref: LectureClass.name, required: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Course.name, required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  lecturerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Semester.name, required: true })
  semesterId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  day: string;

  @Prop({
    type: String,
    enum: TimetablePeriodType,
    required: true,
  })
  type: TimetablePeriodType;

  @Prop({ required: true, trim: true })
  from: string;

  @Prop({ required: true, trim: true })
  to: string;

  @Prop({ type: Types.ObjectId, ref: Hall.name })
  hallId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}

export const PeriodSchema = SchemaFactory.createForClass(Period);

/** Conflict-detection support indexes (instructor / hall / class on same semester+day). */
PeriodSchema.index({ semesterId: 1, day: 1, lecturerId: 1 });
PeriodSchema.index({ semesterId: 1, day: 1, hallId: 1 });
PeriodSchema.index({ semesterId: 1, day: 1, classId: 1 });

/**
 * Natural uniqueness: a class can't have two periods at the same (semester, day, start time).
 * Cross-class conflicts are handled at the service layer.
 */
PeriodSchema.index(
  { classId: 1, semesterId: 1, day: 1, from: 1 },
  { unique: true },
);
