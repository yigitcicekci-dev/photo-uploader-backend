import { HttpStatus } from '@nestjs/common';

export const UserErrors = {
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    messageKey: 'errors.user.not_found',
  },

  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    status: HttpStatus.CONFLICT,
    messageKey: 'errors.user.already_exists',
  },

  DISPLAY_NAME_UPDATED: {
    code: 'DISPLAY_NAME_UPDATED',
    status: HttpStatus.TOO_MANY_REQUESTS,
    messageKey: 'errors.user.display_name_updated',
  },

  USERNAME_ALREADY_EXISTS: {
    code: 'USERNAME_ALREADY_EXISTS',
    status: HttpStatus.CONFLICT,
    messageKey: 'errors.user.username_already_exists',
  },

  INVALID_USER_DATA: {
    code: 'INVALID_USER_DATA',
    status: HttpStatus.BAD_REQUEST,
    messageKey: 'errors.user.invalid_user_data',
  },
} as const;
