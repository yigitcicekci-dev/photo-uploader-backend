import { HttpStatus } from '@nestjs/common';

export const CommonErrors = {
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    status: HttpStatus.BAD_REQUEST,
    messageKey: 'errors.common.bad_request',
  },

  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: HttpStatus.UNAUTHORIZED,
    messageKey: 'errors.common.unauthorized',
  },

  FORBIDDEN: {
    code: 'FORBIDDEN',
    status: HttpStatus.FORBIDDEN,
    messageKey: 'errors.common.forbidden',
  },

  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    messageKey: 'errors.common.not_found',
  },

  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    messageKey: 'errors.common.internal_server_error',
  },

  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    messageKey: 'errors.common.validation_failed',
  },
} as const;
