import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TimetablePeriodType } from '../../period/enums/timetable-period-type.enum';
import { Period } from '../../period/schemas/period.schema';
import { Semester } from '../../semester/schemas/semester.schema';
import { LectureClass } from '../../classes/schemas/lecture-class.schema';
import { Course } from '../../course/schemas/course.schema';
import { User } from '../../users/schemas/user.schema';
import { Hall } from '../../hall/schemas/hall.schema';
import { Faculty } from '../../faculty/schemas/faculty.schema';
import { Department } from '../../department/schemas/department.schema';
import { Campus } from '../../campus/schemas/campus.schema';
import { AcademicYear } from '../../academic-year/schemas/academic-year.schema';
import { ClassSessionStatus } from '../enums/class-session-status.enum';

export type ClassSessionDocument = HydratedDocument<ClassSession>;

/** One dated occurrence of a timetable period (for attendance / reporting). */
@Schema({ timestamps: true, collection: 'class_sessions' })
export class ClassSession {
  @Prop({ type: Types.ObjectId, ref: Period.name, required: true })
  periodId: Types.ObjectId;

  /** UTC midnight for the calendar teaching day. */
  @Prop({ type: Date, required: true })
  scheduledDate: Date;

  @Prop({ type: Types.ObjectId, ref: Semester.name, required: true })
  semesterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: LectureClass.name, required: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Course.name, required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  lecturerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Hall.name })
  hallId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  dayLabel: string;

  @Prop({ required: true, trim: true })
  fromTime: string;

  @Prop({ required: true, trim: true })
  toTime: string;

  @Prop({
    type: String,
    enum: TimetablePeriodType,
    required: true,
  })
  type: TimetablePeriodType;

  @Prop({ type: Types.ObjectId, ref: Faculty.name, required: true })
  facultyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Department.name, required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Campus.name, required: true })
  campusId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AcademicYear.name, required: true })
  academicYearId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ClassSessionStatus,
    default: ClassSessionStatus.SCHEDULED,
  })
  status: ClassSessionStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}

export const ClassSessionSchema = SchemaFactory.createForClass(ClassSession);
ClassSessionSchema.index({ periodId: 1, scheduledDate: 1 }, { unique: true });
ClassSessionSchema.index({ semesterId: 1, scheduledDate: 1 });
ClassSessionSchema.index({ lecturerId: 1, scheduledDate: 1 });
ClassSessionSchema.index({ facultyId: 1, scheduledDate: 1 });
