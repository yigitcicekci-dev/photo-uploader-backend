import { HttpException } from '@nestjs/common';
import { ErrorCode, ErrorRegistry } from '../errors/error-registry';

export class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    public readonly meta?: unknown,
  ) {
    const error = ErrorRegistry[code];
    super(
      {
        code,
        message: error.messageKey,
        meta,
      },
      error.status,
    );
  }
}
