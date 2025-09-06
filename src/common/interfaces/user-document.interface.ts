import { Document, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}
