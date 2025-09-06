import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: false })
  userAgent?: string;

  @Prop({ required: false })
  ipAddress?: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: false })
  lastActivityAt?: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Index for efficient queries
SessionSchema.index({ userId: 1, deviceId: 1 });
SessionSchema.index({ accessToken: 1 });
SessionSchema.index({ refreshToken: 1 });
SessionSchema.index({ isActive: 1, lastActivityAt: 1 });
