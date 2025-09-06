import { Controller, Put, Body, UseGuards, Logger, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import * as currentUserDecorator from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateMeUserDto } from '../dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiSecurity,
  ApiHeader,
} from '@nestjs/swagger';
import { IUserDocument } from 'src/common/interfaces/user-document.interface';

@ApiTags('User')
@ApiSecurity('device-id')
@ApiSecurity('accept-language')
@ApiHeader({
  name: 'device-id',
  description: 'Unique device identifier (UUID recommended)',
  required: true,
})
@ApiHeader({
  name: 'accept-language',
  description: 'Language preference (tr or en)',
  required: true,
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Put('me')
  @ApiOperation({
    summary: 'Update current user profile (username, language)',
    description: 'Update user profile information.',
  })
  @ApiBody({ type: UpdateMeUserDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid data or display name updated too recently',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Username already exists',
  })
  async updateMe(
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
    @Body() payload: UpdateMeUserDto,
  ): Promise<{ success: boolean }> {
    const result = await this.userService.updateUser(user.userId, payload);
    return { success: result };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the current authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: '60f1b2b3b3b3b3b3b3b3b3b3',
        username: 'johndoe',
        email: 'user@example.com',
        role: 'user',
        createdAt: '2025-09-06T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getProfile(
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
  ) {
    const userProfile = await this.userService.getUserById(user.userId);
    return {
      id: userProfile._id,
      username: userProfile.username,
      email: userProfile.email,
      role: userProfile.role,
      createdAt: (userProfile as IUserDocument).createdAt,
    };
  }
}
