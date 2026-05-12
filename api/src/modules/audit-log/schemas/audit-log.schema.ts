import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Faculty } from '../../faculty/schemas/faculty.schema';
import { AuditAction, AuditEntity } from '../enums/audit-action.enum';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' })
export class AuditLog {
  /** May be null for system-generated entries (cron jobs). */
  @Prop({ type: Types.ObjectId, ref: User.name, default: null, index: true })
  actorId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  actorRole: string | null;

  @Prop({ type: String, enum: AuditAction, required: true, index: true })
  action: AuditAction;

  @Prop({ type: String, enum: AuditEntity, required: true, index: true })
  entityType: AuditEntity;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  entityId: Types.ObjectId | null;

  /** Denormalized for scoped queries. */
  @Prop({
    type: Types.ObjectId,
    ref: Faculty.name,
    default: null,
    index: true,
  })
  facultyId: Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  before: unknown;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  after: unknown;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  metadata: unknown;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
