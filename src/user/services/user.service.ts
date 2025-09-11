import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateMeUserDto } from '../dto/update-user.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { IUserDocument } from '../../common/interfaces/user-document.interface';
import {
  generateUniqueUsername,
  mapToLanguageEnum,
} from '../../common/utils/helper.utils';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userRepository.findByEmail(data.email);

    if (existing) {
      throw new AppException('USER_ALREADY_EXISTS');
    }

    if (data.username) {
      const existingUsername = await this.userRepository.findByUsername(
        data.username,
      );
      if (existingUsername) {
        throw new AppException('USERNAME_ALREADY_EXISTS');
      }
    }

    return await this.userRepository.create(data);
  }

  async getUserById(id: string | Types.ObjectId): Promise<UserDocument> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppException('USER_NOT_FOUND');
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
      throw new AppException('USER_NOT_FOUND');
    }

    return user;
  }

  async updateUser(
    id: string | Types.ObjectId,
    data: UpdateMeUserDto,
  ): Promise<boolean> {
    if (data.username) {
      const existingUsername = await this.userRepository.findByUsername(
        data.username,
      );
      if (
        existingUsername &&
        (existingUsername as IUserDocument)._id.toString() !== id.toString()
      ) {
        throw new AppException('USERNAME_ALREADY_EXISTS');
      }
    }

    const updateData = { ...data };
    if (updateData.language) {
      updateData.language = mapToLanguageEnum(updateData.language);
    }

    await this.userRepository.update(id, updateData);
    return true;
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

  async getUsersCount(): Promise<number> {
    return this.userRepository.getUsersCount();
  }
}
