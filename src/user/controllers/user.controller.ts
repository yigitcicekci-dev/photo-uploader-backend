import { Controller, Put, Body, UseGuards, Logger } from '@nestjs/common';
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
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Put('me')
  @ApiOperation({
    summary: 'Update current user profile (username, displayName, language)',
    description:
      'Update user profile information. Display name can only be updated once every 30 days.',
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
  @ApiResponse({
    status: 429,
    description: 'Display name updated too recently',
  })
  async updateMe(
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
    @Body() payload: UpdateMeUserDto,
  ): Promise<{ success: boolean }> {
    const result = await this.userService.updateUser(user.userId, payload);
    return { success: result };
  }
}
