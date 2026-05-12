import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ClassSession } from '../../class-session/schemas/class-session.schema';
import { Faculty } from '../../faculty/schemas/faculty.schema';
import { SubmissionStatus } from '../enums/submission-status.enum';
import { SubmissionType } from '../enums/submission-type.enum';

export type AbsenceSubmissionDocument = HydratedDocument<AbsenceSubmission>;

/** Audit row appended every time the status of a submission transitions. */
export class SubmissionDecisionEntry {
  @Prop({
    type: String,
    enum: SubmissionStatus,
    required: true,
  })
  status: SubmissionStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  actorId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  at: Date;

  @Prop({ type: String })
  note?: string;
}

@Schema({ timestamps: true, collection: 'absence_submissions' })
export class AbsenceSubmission {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  instructorUserId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: ClassSession.name,
    required: true,
    index: true,
  })
  sessionId: Types.ObjectId;

  /** Denormalized for fast faculty-scoped queries (matches `class-session.facultyId`). */
  @Prop({
    type: Types.ObjectId,
    ref: Faculty.name,
    required: true,
    index: true,
  })
  facultyId: Types.ObjectId;

  @Prop({ type: String, enum: SubmissionType, required: true })
  type: SubmissionType;

  @Prop({ type: String, required: true, trim: true, maxlength: 200 })
  reason: string;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  description?: string;

  @Prop({
    type: String,
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
    index: true,
  })
  status: SubmissionStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, default: null })
  reviewerId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt: Date | null;

  @Prop({ type: String })
  reviewNote?: string;

  @Prop({
    type: [
      {
        status: { type: String, enum: SubmissionStatus, required: true },
        actorId: { type: Types.ObjectId, ref: User.name, required: true },
        at: { type: Date, required: true },
        note: { type: String },
      },
    ],
    default: [],
  })
  decisionHistory: SubmissionDecisionEntry[];
}

export const AbsenceSubmissionSchema =
  SchemaFactory.createForClass(AbsenceSubmission);

/**
 * Natural uniqueness: an instructor cannot file the same kind of request twice
 * for the same session. Re-submission requires deleting the previous one.
 */
AbsenceSubmissionSchema.index(
  { instructorUserId: 1, sessionId: 1, type: 1 },
  { unique: true },
);
AbsenceSubmissionSchema.index({ facultyId: 1, status: 1, createdAt: -1 });
