import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { ConfigService } from '@nestjs/config';
import { MediaRepository } from '../repositories/media.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import {
  MediaPermissionDto,
  PermissionAction,
} from '../dto/media-permission.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Types } from 'mongoose';
import { IMediaDocument } from '../interfaces/media-document.interface';
import { IUserDocument } from 'src/common/interfaces/user-document.interface';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class MediaService {
  constructor(
    private mediaRepository: MediaRepository,
    private userRepository: UserRepository,
    private configService: ConfigService,
  ) {}

  async uploadMedia(file: Express.Multer.File, userId: string) {
    const uploadDir =
      this.configService.get<string>('upload.dir') || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const media = await this.mediaRepository.create({
      ownerId: new Types.ObjectId(userId),
      fileName: file.originalname,
      filePath,
      mimeType: file.mimetype,
      size: file.size,
      allowedUserIds: [],
    });

    return {
      id: media._id,
      fileName: media.fileName,
      mimeType: media.mimeType,
      size: media.size,
      createdAt: (media as IMediaDocument).createdAt,
    };
  }

  async getMyMedia(userId: string) {
    const media = await this.mediaRepository.findByOwnerId(userId);
    return media.map((item) => ({
      id: item._id,
      fileName: item.fileName,
      mimeType: item.mimeType,
      size: item.size,
      allowedUsers: item.allowedUserIds.length,
      createdAt: (item as IMediaDocument).createdAt,
    }));
  }

  async getMediaById(mediaId: string, userId: string) {
    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND');
    }

    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new AppException('USER_NOT_FOUND');
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const userIdObjectId = new Types.ObjectId(userId);
    const hasAccess =
      media.ownerId.equals(userIdObjectId) ||
      media.allowedUserIds.some((id) => id.equals(userIdObjectId));

    if (!isAdmin && !hasAccess) {
      throw new AppException('ACCESS_DENIED');
    }

    return {
      id: media._id,
      fileName: media.fileName,
      mimeType: media.mimeType,
      size: media.size,
      owner: media.ownerId,
      allowedUsers: media.allowedUserIds.length,
      createdAt: (media as IMediaDocument).createdAt,
    };
  }

  async downloadMedia(mediaId: string, userId: string) {
    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND');
    }

    const userIdObjectId = new Types.ObjectId(userId);
    const hasAccess =
      media.ownerId.equals(userIdObjectId) ||
      media.allowedUserIds.some((id) => id.equals(userIdObjectId));

    if (!hasAccess) {
      throw new AppException('ACCESS_DENIED');
    }

    if (!fs.existsSync(media.filePath)) {
      throw new AppException('FILE_NOT_FOUND_ON_DISK');
    }

    return {
      filePath: media.filePath,
      fileName: media.fileName,
      mimeType: media.mimeType,
    };
  }

  async deleteMedia(mediaId: string, userId: string) {
    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND');
    }

    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new AppException('USER_NOT_FOUND');
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const userIdObjectId = new Types.ObjectId(userId);
    const isOwner = media.ownerId.equals(userIdObjectId);

    if (!isAdmin && !isOwner) {
      throw new AppException('PERMISSION_DENIED');
    }

    if (fs.existsSync(media.filePath)) {
      fs.unlinkSync(media.filePath);
    }

    await this.mediaRepository.deleteById(mediaId);
    return { message: 'Media deleted successfully' };
  }

  async getPermissions(mediaId: string, userId: string) {
    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND');
    }

    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new AppException('USER_NOT_FOUND');
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const userIdObjectId = new Types.ObjectId(userId);
    const isOwner = media.ownerId.equals(userIdObjectId);

    if (!isAdmin && !isOwner) {
      throw new AppException('PERMISSION_DENIED');
    }

    const allowedUsers = await Promise.all(
      media.allowedUserIds.map(async (allowedUserId) => {
        const user = await this.userRepository.findById(allowedUserId);
        return user ? { id: user._id, email: user.email } : null;
      }),
    );

    return {
      mediaId: media._id,
      fileName: media.fileName,
      allowedUsers: allowedUsers.filter((user) => user !== null),
    };
  }

  async managePermissions(
    mediaId: string,
    userId: string,
    permissionDto: MediaPermissionDto,
  ) {
    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND');
    }

    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new AppException('USER_NOT_FOUND');
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const userIdObjectId = new Types.ObjectId(userId);
    const isOwner = media.ownerId.equals(userIdObjectId);

    if (!isAdmin && !isOwner) {
      throw new AppException('PERMISSION_DENIED');
    }

    const targetUser = await this.userRepository.findById(permissionDto.userId);
    if (!targetUser) {
      throw new AppException('USER_NOT_FOUND');
    }

    const targetUserIdObjectId = new Types.ObjectId(permissionDto.userId);
    if (userIdObjectId.equals(targetUserIdObjectId)) {
      throw new AppException('BAD_REQUEST');
    }

    let updatedMedia;
    if (permissionDto.action === PermissionAction.ADD) {
      updatedMedia = await this.mediaRepository.addPermission(
        mediaId,
        permissionDto.userId,
      );
    } else {
      updatedMedia = await this.mediaRepository.removePermission(
        mediaId,
        permissionDto.userId,
      );
    }

    return {
      message: `Permission ${permissionDto.action}ed successfully`,
      mediaId: (updatedMedia as IMediaDocument)._id,
      targetUser: {
        id: (targetUser as unknown as IUserDocument)._id.toString(),
        email: targetUser.email,
      },
    };
  }
}
