import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../../../common/enums/entity-status.enum';
import { Department } from '../../department/schemas/department.schema';
import { User } from '../../users/schemas/user.schema';

import { CourseType } from '../enums/course-type.enum';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: Department.name, required: false })
  departmentId?: Types.ObjectId;

  @Prop({ type: String, enum: CourseType, required: true })
  type: CourseType;

  @Prop({ required: true })
  credit: number;

  @Prop({ type: [Types.ObjectId], ref: User.name, default: [] })
  lecturers: Types.ObjectId[];

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
