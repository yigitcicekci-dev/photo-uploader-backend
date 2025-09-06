import { CommonErrors } from './common.errors';
import { AuthenticationErrors } from './authentication.errors';
import { MediaErrors } from './media.errors';
import { UserErrors } from './user.errors';

export const ErrorRegistry = {
  ...CommonErrors,
  ...AuthenticationErrors,
  ...MediaErrors,
  ...UserErrors,
};

export interface ErrorWithTranslation {
  code: string;
  statusCode: number;
  translationKey: string;
  translationParams?: Record<string, any>;
}

export const ErrorTranslationMap = {
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
    translationKey: 'errors.common.INTERNAL_SERVER_ERROR',
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    statusCode: 400,
    translationKey: 'errors.common.BAD_REQUEST',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    statusCode: 401,
    translationKey: 'errors.common.UNAUTHORIZED',
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    statusCode: 409,
    translationKey: 'errors.authentication.USER_ALREADY_EXISTS',
  },
  USERNAME_ALREADY_EXISTS: {
    code: 'USERNAME_ALREADY_EXISTS',
    statusCode: 409,
    translationKey: 'errors.authentication.USERNAME_ALREADY_EXISTS',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    statusCode: 401,
    translationKey: 'errors.authentication.INVALID_CREDENTIALS',
  },
  WEAK_PASSWORD: {
    code: 'WEAK_PASSWORD',
    statusCode: 400,
    translationKey: 'errors.authentication.WEAK_PASSWORD',
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    statusCode: 401,
    translationKey: 'errors.authentication.INVALID_TOKEN',
  },
  ACCESS_TOKEN_EXPIRED: {
    code: 'ACCESS_TOKEN_EXPIRED',
    statusCode: 401,
    translationKey: 'errors.authentication.ACCESS_TOKEN_EXPIRED',
  },
  INVALID_REFRESH_TOKEN: {
    code: 'INVALID_REFRESH_TOKEN',
    statusCode: 401,
    translationKey: 'errors.authentication.INVALID_REFRESH_TOKEN',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    statusCode: 404,
    translationKey: 'errors.user.USER_NOT_FOUND',
  },
  MEDIA_NOT_FOUND: {
    code: 'MEDIA_NOT_FOUND',
    statusCode: 404,
    translationKey: 'errors.media.MEDIA_NOT_FOUND',
  },
  ACCESS_DENIED: {
    code: 'ACCESS_DENIED',
    statusCode: 403,
    translationKey: 'errors.media.ACCESS_DENIED',
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    statusCode: 403,
    translationKey: 'errors.media.PERMISSION_DENIED',
  },
  FILE_NOT_FOUND_ON_DISK: {
    code: 'FILE_NOT_FOUND_ON_DISK',
    statusCode: 404,
    translationKey: 'errors.media.FILE_NOT_FOUND_ON_DISK',
  },
} as const;

export type ErrorCode = keyof typeof ErrorTranslationMap;
