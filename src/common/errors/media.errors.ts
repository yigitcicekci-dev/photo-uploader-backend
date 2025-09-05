import { HttpStatus } from '@nestjs/common';

export const MediaErrors = {
  MEDIA_NOT_FOUND: {
    code: 'MEDIA_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    messageKey: 'errors.media.media_not_found',
  },

  ACCESS_DENIED: {
    code: 'ACCESS_DENIED',
    status: HttpStatus.FORBIDDEN,
    messageKey: 'errors.media.access_denied',
  },

  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    status: HttpStatus.BAD_REQUEST,
    messageKey: 'errors.media.invalid_file_type',
  },

  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    status: HttpStatus.BAD_REQUEST,
    messageKey: 'errors.media.file_too_large',
  },

  FILE_UPLOAD_FAILED: {
    code: 'FILE_UPLOAD_FAILED',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    messageKey: 'errors.media.file_upload_failed',
  },

  FILE_NOT_FOUND_ON_DISK: {
    code: 'FILE_NOT_FOUND_ON_DISK',
    status: HttpStatus.NOT_FOUND,
    messageKey: 'errors.media.file_not_found_on_disk',
  },

  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    status: HttpStatus.FORBIDDEN,
    messageKey: 'errors.media.permission_denied',
  },
} as const;
