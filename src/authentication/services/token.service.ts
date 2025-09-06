import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
  sub?: string;
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.ensureJwtSecret();
    this.accessTokenExpiry = this.getConfigValue(
      'jwt.accessTokenExpiration',
      '1h',
    );
    this.refreshTokenExpiry = this.getConfigValue(
      'jwt.refreshTokenExpiration',
      '7d',
    );
  }

  generateTokens(
    payload: Omit<TokenPayload, 'sub' | 'iat' | 'exp'>,
  ): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    const expiresAt = this.calculateExpiration(this.accessTokenExpiry);

    return { accessToken, refreshToken, expiresAt };
  }

  private generateAccessToken(
    payload: Omit<TokenPayload, 'sub' | 'iat' | 'exp'>,
  ): string {
    const tokenPayload: TokenPayload = {
      ...payload,
      sub: 'ACCESS_TOKEN',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(tokenPayload, {
      expiresIn: this.accessTokenExpiry,
      secret: this.getJwtSecret(),
    });
  }

  private generateRefreshToken(
    payload: Omit<TokenPayload, 'sub' | 'iat' | 'exp'>,
  ): string {
    const tokenPayload: TokenPayload = {
      ...payload,
      sub: 'REFRESH_TOKEN',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(tokenPayload, {
      expiresIn: this.refreshTokenExpiry,
      secret: this.getJwtRefreshSecret(),
    });
  }

  verifyToken(token: string, isRefreshToken = false): TokenPayload {
    const expectedSub = isRefreshToken ? 'REFRESH_TOKEN' : 'ACCESS_TOKEN';
    const secret = isRefreshToken
      ? this.getJwtRefreshSecret()
      : this.getJwtSecret();

    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret,
      });

      if (payload.sub !== expectedSub) {
        throw new Error(
          `Invalid token type. Expected: ${expectedSub}, Got: ${payload.sub}`,
        );
      }

      return payload;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Token verification failed: ${errorMessage}`);
      throw error;
    }
  }

  private calculateExpiration(expiry: string): Date {
    const now = Date.now();
    const match = expiry.match(/^(\d+)([mhd])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === 'm') return new Date(now + value * 60 * 1000);
      if (unit === 'h') return new Date(now + value * 60 * 60 * 1000);
      if (unit === 'd') return new Date(now + value * 24 * 60 * 60 * 1000);
    }

    this.logger.warn(
      `Invalid expiry format '${expiry}', defaulting to 15 minutes.`,
    );
    return new Date(now + 15 * 60 * 1000);
  }

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('jwt.accessSecret');
    if (!secret) {
      this.logger.error(
        'JWT_ACCESS_SECRET is not configured in environment variables',
      );
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }
    return secret;
  }

  private getJwtRefreshSecret(): string {
    const secret = this.configService.get<string>('jwt.refreshSecret');
    if (!secret) {
      this.logger.error(
        'JWT_REFRESH_SECRET is not configured in environment variables',
      );
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    return secret;
  }

  private ensureJwtSecret(): void {
    this.getJwtSecret();
    this.getJwtRefreshSecret();
  }

  private getConfigValue(key: string, defaultValue: string): string {
    const value = this.configService.get<string>(key);
    return value ?? defaultValue;
  }
}
