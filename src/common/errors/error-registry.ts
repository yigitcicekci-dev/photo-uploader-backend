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

export type ErrorCode = keyof typeof ErrorRegistry;
