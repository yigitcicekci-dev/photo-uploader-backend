import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../user/repositories/user.repository';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import {
  AuthResponse,
  TokenResponse,
  UserResponse,
} from '../dto/auth-response.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { TokenService } from './token.service';
import { toDto } from '../../common/utils/helper.utils';
import { IUserDocument } from '../../common/interfaces/user-document.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const existingUser = await this.userRepository.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new AppException('USER_ALREADY_EXISTS');
      }

      if (!this.isValidPassword(registerDto.password)) {
        throw new AppException('WEAK_PASSWORD');
      }

      const passwordHash = await bcrypt.hash(registerDto.password, 12);
      const user = await this.userRepository.create({
        email: registerDto.email.toLowerCase().trim(),
        passwordHash,
        role: registerDto.role || 'user',
      });

      const tokens = this.tokenService.generateTokens({
        userId: (user as IUserDocument)._id.toString(),
        email: user.email,
        role: user.role,
      });

      const userResponse: UserResponse = {
        id: (user as IUserDocument)._id.toString(),
        email: user.email,
        role: user.role,
        createdAt: (user as IUserDocument).createdAt,
      };

      return {
        user: userResponse,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new AppException('INTERNAL_SERVER_ERROR', errorMessage);
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.userRepository.findByEmail(
        loginDto.email.toLowerCase().trim(),
      );

      if (!user) {
        throw new AppException('INVALID_CREDENTIALS');
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new AppException('INVALID_CREDENTIALS');
      }

      const tokens = this.tokenService.generateTokens({
        userId: (user as IUserDocument)._id.toString(),
        email: user.email,
        role: user.role,
      });

      const userResponse: UserResponse = {
        id: (user as IUserDocument)._id.toString(),
        email: user.email,
        role: user.role,
        createdAt: (user as IUserDocument).createdAt,
      };

      return {
        user: userResponse,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new AppException('INTERNAL_SERVER_ERROR', errorMessage);
    }
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.tokenService.verifyToken(refreshToken, true);

      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new AppException('USER_NOT_FOUND');
      }

      const tokens = this.tokenService.generateTokens({
        userId: (user as IUserDocument)._id.toString(),
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException('INVALID_REFRESH_TOKEN');
    }
  }

  async validateUser(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return null;
      }

      return {
        id: (user as IUserDocument)._id.toString(),
        email: user.email,
        role: user.role,
      };
    } catch {
      return null;
    }
  }

  getMyProfileData(user: {
    userId: string;
    email: string;
    role: string;
  }): UserResponse {
    return toDto(UserResponse, {
      id: user.userId,
      email: user.email,
      role: user.role,
      createdAt: new Date(),
    });
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return password.length >= 8 && passwordRegex.test(password);
  }
}
