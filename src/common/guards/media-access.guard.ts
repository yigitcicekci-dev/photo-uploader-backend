import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MediaRepository } from '../../media/repositories/media.repository';
import { AppException } from '../exceptions/app.exception';

interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUserAndParams {
  user: AuthenticatedUser;
  params: { id: string };
}

@Injectable()
export class MediaAccessGuard implements CanActivate {
  constructor(private mediaRepository: MediaRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUserAndParams>();
    const user = request.user;
    const mediaId = request.params?.id;

    if (!user || !mediaId) {
      throw new AppException('ACCESS_DENIED');
    }

    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND');
    }

    const hasAccess =
      media.ownerId.toString() === user.userId ||
      media.allowedUserIds.some((id) => id.toString() === user.userId);

    if (!hasAccess) {
      throw new AppException('ACCESS_DENIED');
    }

    return true;
  }
}
