import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { SessionRepository } from '../repositories/session.repository';
import { SessionDocument } from '../schemas/session.schema';

export interface CreateSessionData {
  userId: Types.ObjectId;
  deviceId: string;
  accessToken: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(
    sessionData: CreateSessionData,
  ): Promise<SessionDocument> {
    this.logger.log(
      `Creating session for user ${sessionData.userId.toString()} on device ${sessionData.deviceId}`,
    );
    await this.sessionRepository.deactivateAllUserSessionsExcept(
      sessionData.userId,
      sessionData.deviceId,
    );

    return this.sessionRepository.create(sessionData);
  }

  async validateSession(accessToken: string): Promise<SessionDocument | null> {
    const session = await this.sessionRepository.findByAccessToken(accessToken);
    if (!session) {
      this.logger.warn(
        `Invalid or expired session for token: ${accessToken.substring(0, 20)}...`,
      );
      return null;
    }

    await this.sessionRepository.updateLastActivity(
      session._id as Types.ObjectId,
    );
    return session;
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<SessionDocument | null> {
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session) {
      this.logger.warn(
        `Invalid refresh token: ${refreshToken.substring(0, 20)}...`,
      );
      return null;
    }

    return session;
  }

  async invalidateSession(accessToken: string): Promise<void> {
    const session = await this.sessionRepository.findByAccessToken(accessToken);
    if (session) {
      await this.sessionRepository.deactivateSession(
        session._id as Types.ObjectId,
      );
      this.logger.log(
        `Session invalidated for user ${session.userId.toString()}`,
      );
    }
  }

  async invalidateAllUserSessions(userId: Types.ObjectId): Promise<void> {
    await this.sessionRepository.deactivateAllUserSessions(userId);
    this.logger.log(`All sessions invalidated for user ${userId.toString()}`);
  }

  async getActiveSessions(userId: Types.ObjectId): Promise<SessionDocument[]> {
    return this.sessionRepository.findActiveSessionsByUser(userId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository.deleteExpiredSessions();
    this.logger.log('Expired sessions cleaned up');
  }
}
