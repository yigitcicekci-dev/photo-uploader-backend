import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from '../schemas/session.schema';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async create(sessionData: {
    userId: Types.ObjectId;
    deviceId: string;
    accessToken: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<SessionDocument> {
    const session = new this.sessionModel(sessionData);
    return session.save();
  }

  async findByAccessToken(
    accessToken: string,
  ): Promise<SessionDocument | null> {
    return this.sessionModel.findOne({ accessToken, isActive: true }).exec();
  }

  async findByRefreshToken(
    refreshToken: string,
  ): Promise<SessionDocument | null> {
    return this.sessionModel.findOne({ refreshToken, isActive: true }).exec();
  }

  async findByUserAndDevice(
    userId: Types.ObjectId,
    deviceId: string,
  ): Promise<SessionDocument | null> {
    return this.sessionModel
      .findOne({ userId, deviceId, isActive: true })
      .exec();
  }

  async findActiveSessionsByUser(
    userId: Types.ObjectId,
  ): Promise<SessionDocument[]> {
    return this.sessionModel
      .find({ userId, isActive: true })
      .sort({ lastActivityAt: -1 })
      .exec();
  }

  async deactivateSession(sessionId: Types.ObjectId): Promise<void> {
    await this.sessionModel
      .findByIdAndUpdate(sessionId, { isActive: false })
      .exec();
  }

  async deactivateAllUserSessions(userId: Types.ObjectId): Promise<void> {
    await this.sessionModel.updateMany({ userId }, { isActive: false }).exec();
  }

  async deactivateAllUserSessionsExcept(
    userId: Types.ObjectId,
    currentDeviceId: string,
  ): Promise<void> {
    await this.sessionModel
      .updateMany(
        { userId, deviceId: { $ne: currentDeviceId } },
        { isActive: false },
      )
      .exec();
  }

  async updateLastActivity(sessionId: Types.ObjectId): Promise<void> {
    await this.sessionModel
      .findByIdAndUpdate(sessionId, { lastActivityAt: new Date() })
      .exec();
  }

  async deleteExpiredSessions(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.sessionModel
      .deleteMany({
        isActive: false,
        updatedAt: { $lt: thirtyDaysAgo },
      })
      .exec();
  }

  async deleteSession(sessionId: Types.ObjectId): Promise<void> {
    await this.sessionModel.findByIdAndDelete(sessionId).exec();
  }
}
