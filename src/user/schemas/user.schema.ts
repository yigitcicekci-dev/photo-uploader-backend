import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false, unique: true, sparse: true })
  username?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: false })
  displayName?: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ required: false, default: 'en_US' })
  language?: string;

  @Prop({ required: false, default: true })
  enabled: boolean;

  @Prop({ required: false, default: false })
  blocked: boolean;

  @Prop({ required: false, default: false })
  deleted: boolean;

  @Prop({ required: false })
  deletedAt?: Date;

  @Prop({ required: false })
  displayNameUpdated?: Date;

  @Prop({ required: false, default: 1200 })
  rating?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
