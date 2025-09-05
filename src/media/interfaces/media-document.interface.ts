import { Document, Types } from 'mongoose';

export interface IMediaDocument extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  allowedUserIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
