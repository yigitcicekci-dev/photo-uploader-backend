import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppException } from '../exceptions/app.exception';
import { UserRepository } from '../../user/repositories/user.repository';
import { TokenPayload } from '../../authentication/services/token.service';
import { IUserDocument } from '../interfaces/user-document.interface';

interface RequestWithAuth {
  headers: {
    authorization?: string;
    'device-id'?: string;
  };
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const authHeader = request.headers?.authorization;
    const deviceId = request.headers?.['device-id'];

    if (!authHeader) {
      throw new AppException('INVALID_TOKEN');
    }

    const authParts = authHeader.split(' ');
    const [type, token] = authParts;

    if (type !== 'Bearer') {
      throw new AppException('BAD_REQUEST');
    }

    const secret: string | undefined =
      this.configService.get<string>('jwt.accessSecret');

    let payload: TokenPayload;

    try {
      payload = this.jwtService.verify<TokenPayload>(token, { secret });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`JWT verification failed: ${errorMessage}`);
      throw new AppException('ACCESS_TOKEN_EXPIRED');
    }

    if (payload && payload.sub !== 'ACCESS_TOKEN') {
      throw new AppException('UNAUTHORIZED');
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new AppException('USER_NOT_FOUND');
    }

    if (deviceId && typeof deviceId === 'string') {
      const expectedDeviceId = `${payload.userId}_${deviceId}`;
      this.logger.debug(
        `Device validation - Expected: ${expectedDeviceId}, User: ${payload.userId}`,
      );
    }
    const userDoc = user as IUserDocument;
    request.user = {
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
    };

    return true;
  }
}
