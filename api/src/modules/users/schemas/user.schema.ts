import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username: string;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ required: true })
  passcodeHash: string;

  @Prop({ type: Types.ObjectId, ref: Role.name, required: true })
  role: Types.ObjectId;

  /** When set, Faculty Admin / scoped instructors are limited to this faculty. */
  @Prop({ type: Types.ObjectId, ref: 'Faculty' })
  facultyId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: string;

  @Prop({ default: true })
  isActive: boolean;

  /** Device ID registered for attendance check-in (1 device per instructor). */
  @Prop({ type: String, trim: true })
  registeredDeviceId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

/** Each device id can be registered to at most one user. `sparse` so unset values aren't compared. */
UserSchema.index(
  { registeredDeviceId: 1 },
  { unique: true, sparse: true },
);
