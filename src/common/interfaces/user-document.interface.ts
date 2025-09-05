import { Document, Types } from 'mongoose';

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  username?: string;
  email: string;
  passwordHash: string;
  displayName?: string;
  role: string;
  language?: string;
  enabled: boolean;
  blocked: boolean;
  deleted: boolean;
  deletedAt?: Date;
  displayNameUpdated?: Date;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}
