import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateMeUserDto } from '../dto/update-user.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { UserErrors } from '../../common/errors/user.errors';
import { AuthenticationErrors } from '../../common/errors/authentication.errors';
import { IUserDocument } from '../../common/interfaces/user-document.interface';
import {
  mapToLanguageEnum,
  getNextDisplayNameUpdateDate,
  generateUniqueUsername,
} from '../../common/utils/helper.utils';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userRepository.findByEmail(data.email);

    if (existing) {
      throw new AppException(UserErrors.USER_ALREADY_EXISTS.code);
    }

    if (data.username) {
      const existingUsername = await this.userRepository.findByUsername(
        data.username,
      );
      if (existingUsername) {
        throw new AppException(UserErrors.USERNAME_ALREADY_EXISTS.code);
      }
    }

    return await this.userRepository.create(data);
  }

  async getUserById(id: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppException(UserErrors.USER_NOT_FOUND.code);
    }

    return user;
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return await this.userRepository.findById(id);
  }

  async getValidatedUserById(
    id: string | Types.ObjectId,
  ): Promise<UserDocument> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppException(UserErrors.USER_NOT_FOUND.code);
    }

    if (user.deleted) {
      throw new AppException(AuthenticationErrors.ACCOUNT_DELETED.code);
    }

    if (user.blocked) {
      throw new AppException(AuthenticationErrors.ACCOUNT_BLOCKED.code);
    }

    if (!user.enabled) {
      throw new AppException(AuthenticationErrors.ACCOUNT_INACTIVE.code);
    }

    return user;
  }

  async updateUser(
    id: string | Types.ObjectId,
    data: UpdateMeUserDto,
  ): Promise<boolean> {
    if (data.displayName) {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new AppException(UserErrors.USER_NOT_FOUND.code);
      }

      if (user.displayNameUpdated) {
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() - 30);

        if (user.displayNameUpdated > thirtyDays) {
          throw new AppException(
            UserErrors.DISPLAY_NAME_UPDATED.code,
            getNextDisplayNameUpdateDate(user.displayNameUpdated),
          );
        }
      }
    }

    if (data.username) {
      const existingUsername = await this.userRepository.findByUsername(
        data.username,
      );
      if (
        existingUsername &&
        (existingUsername as IUserDocument)._id.toString() !== id.toString()
      ) {
        throw new AppException(UserErrors.USERNAME_ALREADY_EXISTS.code);
      }
    }

    const updateData = { ...data };
    if (updateData.language) {
      updateData.language = mapToLanguageEnum(updateData.language);
    }

    if (updateData.displayName) {
      updateData.displayNameUpdated = new Date();
    }

    await this.userRepository.update(id, updateData);
    return true;
  }

  async deleteUser(id: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppException(UserErrors.USER_NOT_FOUND.code);
    }

    const deletedUser = await this.userRepository.delete(id);
    if (!deletedUser) {
      throw new AppException(UserErrors.USER_NOT_FOUND.code);
    }
    return deletedUser;
  }

  async softDeleteUser(userId: string | Types.ObjectId): Promise<void> {
    await this.userRepository.softDeleteUser(userId);
  }

  async reactivateUser(
    user: Pick<UserDocument, '_id' | 'deleted'>,
  ): Promise<void> {
    if (!user) {
      throw new AppException(UserErrors.USER_NOT_FOUND.code);
    }
    if (!user.deleted) return;
    await this.userRepository.reactivateUser((user as IUserDocument)._id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.userRepository.existsByEmail(email);
  }

  async existsByUsername(username: string): Promise<boolean> {
    return await this.userRepository.existsByUsername(username);
  }

  async findFirstUniqueUsername(usernames: string[]): Promise<string> {
    for (const username of usernames) {
      if (!(await this.existsByUsername(username))) {
        return username;
      }
    }
    throw new Error('No unique username found');
  }

  async generateUsernameFromEmail(email: string): Promise<string> {
    const baseUsername = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const suggestions = generateUniqueUsername(baseUsername);
    return await this.findFirstUniqueUsername(suggestions);
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async findAllUsers(): Promise<UserDocument[]> {
    return this.userRepository.findAll();
  }

  async findActiveUsers(): Promise<UserDocument[]> {
    return this.userRepository.findActiveUsers();
  }

  async getUsersCount(): Promise<number> {
    return this.userRepository.getUsersCount();
  }

  async blockUser(userId: string | Types.ObjectId): Promise<void> {
    await this.getUserById(userId);
    await this.userRepository.blockUser(userId);
  }

  async unblockUser(userId: string | Types.ObjectId): Promise<void> {
    await this.getUserById(userId);
    await this.userRepository.unblockUser(userId);
  }

  async disableUser(userId: string | Types.ObjectId): Promise<void> {
    await this.getUserById(userId);
    await this.userRepository.disableUser(userId);
  }

  async enableUser(userId: string | Types.ObjectId): Promise<void> {
    await this.getUserById(userId);
    await this.userRepository.enableUser(userId);
  }
}
