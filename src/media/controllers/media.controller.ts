import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Response,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiSecurity,
  ApiHeader,
} from '@nestjs/swagger';
import { MediaService } from '../services/media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MediaAccessGuard } from '../../common/guards/media-access.guard';
import * as currentUserDecorator from '../../common/decorators/current-user.decorator';
import { MediaPermissionDto } from '../dto/media-permission.dto';
import { multerConfig } from '../../common/interceptors/file-validation.interceptor';
import { createReadStream } from 'fs';

@ApiTags('Media')
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
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Media uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
  ) {
    return this.mediaService.uploadMedia(file, user.userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all media files owned by current user' })
  @ApiResponse({
    status: 200,
    description: 'Media files retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyMedia(
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
  ) {
    return this.mediaService.getMyMedia(user.userId);
  }

  @Get(':id')
  @UseGuards(MediaAccessGuard)
  @ApiOperation({ summary: 'Get media file details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Media details retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async getMediaById(
    @Param('id') id: string,
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
  ) {
    return this.mediaService.getMediaById(id, user.userId);
  }

  @Get(':id/download')
  @UseGuards(MediaAccessGuard)
  @ApiOperation({ summary: 'Download media file' })
  @ApiResponse({
    status: 200,
    description: 'Media file downloaded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async downloadMedia(
    @Param('id') id: string,
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
    @Response({ passthrough: true })
    res: { set: (headers: Record<string, string>) => void },
  ) {
    const fileData = await this.mediaService.downloadMedia(id, user.userId);
    const file = createReadStream(fileData.filePath);
    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': `attachment; filename="${fileData.fileName}"`,
    });
    return new StreamableFile(file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media file' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async deleteMedia(
    @Param('id') id: string,
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
  ) {
    return this.mediaService.deleteMedia(id, user.userId);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get media permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async getPermissions(
    @Param('id') id: string,
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
  ) {
    return this.mediaService.getPermissions(id, user.userId);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Manage media permissions' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async managePermissions(
    @Param('id') id: string,
    @Body() permissionDto: MediaPermissionDto,
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
  ) {
    return this.mediaService.managePermissions(id, user.userId, permissionDto);
  }
}
