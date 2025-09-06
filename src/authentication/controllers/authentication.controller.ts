import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthenticationService } from '../services/authentication.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponse, TokenResponse } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import * as currentUserDecorator from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
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
@Controller('auth')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email and password',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with this email already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or password requirements not met',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ],
        error: 'Bad Request',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authenticationService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['Email is required', 'Password is required'],
        error: 'Bad Request',
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Request()
    req: {
      headers: Record<string, string | string[] | undefined>;
      ip?: string;
      connection?: { remoteAddress?: string };
    },
  ): Promise<AuthResponse> {
    const deviceId = req.headers['device-id'] as string;
    const userAgent = req.headers['user-agent'] as string;
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.authenticationService.login(
      loginDto,
      deviceId,
      userAgent,
      ipAddress,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: TokenResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired refresh token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token is required',
    schema: {
      example: {
        statusCode: 400,
        message: ['Refresh token is required'],
        error: 'Bad Request',
      },
    },
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    return this.authenticationService.refresh(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidate current session and logout user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async logout(
    @Request() req: { headers: Record<string, string | string[] | undefined> },
  ): Promise<{ message: string }> {
    const authHeader = req.headers.authorization as string;
    const token = authHeader?.split(' ')[1];
    if (token) {
      await this.authenticationService.logout(token);
    }
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout from all devices',
    description: 'Invalidate all sessions for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'All sessions invalidated successfully',
    schema: {
      example: {
        message: 'All sessions invalidated successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async logoutAll(
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.authenticationService.logoutAllSessions(user.userId);
    return { message: 'All sessions invalidated successfully' };
  }
}
