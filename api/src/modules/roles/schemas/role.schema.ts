import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  name: string;

  /** CASL-style rules persisted for dynamic RBAC (optional; defaults come from templates). */
  @Prop({
    type: [
      {
        action: { type: MongooseSchema.Types.Mixed, required: true },
        subject: { type: String, required: true },
        fields: [{ type: String }],
        condition: { type: MongooseSchema.Types.Mixed },
      },
    ],
    default: [],
  })
  ability?: Array<{
    action: string | string[];
    subject: string;
    fields?: string[];
    condition?: Record<string, unknown>;
  }>;

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
