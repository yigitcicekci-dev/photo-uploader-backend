import { HttpStatus } from '@nestjs/common';

export const AuthenticationErrors = {
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    status: HttpStatus.UNAUTHORIZED,
    messageKey: 'errors.authentication.invalid_token',
  },

  ACCESS_TOKEN_EXPIRED: {
    code: 'ACCESS_TOKEN_EXPIRED',
    status: HttpStatus.UNAUTHORIZED,
    messageKey: 'errors.authentication.access_token_expired',
  },

  INVALID_REFRESH_TOKEN: {
    code: 'INVALID_REFRESH_TOKEN',
    status: HttpStatus.UNAUTHORIZED,
    messageKey: 'errors.authentication.invalid_refresh_token',
  },

  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    status: HttpStatus.UNAUTHORIZED,
    messageKey: 'errors.authentication.invalid_credentials',
  },

  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    status: HttpStatus.CONFLICT,
    messageKey: 'errors.authentication.user_already_exists',
  },

  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    messageKey: 'errors.authentication.user_not_found',
  },

  ACCOUNT_INACTIVE: {
    code: 'ACCOUNT_INACTIVE',
    status: HttpStatus.FORBIDDEN,
    messageKey: 'errors.authentication.account_inactive',
  },

  ACCOUNT_BLOCKED: {
    code: 'ACCOUNT_BLOCKED',
    status: HttpStatus.FORBIDDEN,
    messageKey: 'errors.authentication.account_blocked',
  },

  WEAK_PASSWORD: {
    code: 'WEAK_PASSWORD',
    status: HttpStatus.BAD_REQUEST,
    messageKey: 'errors.authentication.weak_password',
  },

  ACCOUNT_DELETED: {
    code: 'ACCOUNT_DELETED',
    status: HttpStatus.FORBIDDEN,
    messageKey: 'errors.authentication.account_deleted',
  },
} as const;
