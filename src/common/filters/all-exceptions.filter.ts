import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppException } from '../exceptions/app.exception';
import { ErrorRegistry, ErrorTranslationMap } from '../errors/error-registry';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let meta: unknown = undefined;

    const lang = this.extractLanguage(request);

    if (exception instanceof AppException) {
      status = exception.getStatus();
      code = exception.code;
      const translationInfo = ErrorTranslationMap[exception.code];
      if (translationInfo) {
        try {
          message = await this.i18n.translate(translationInfo.translationKey, {
            lang,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            args: (translationInfo as any).translationParams || {},
          });
        } catch {
          const errorInfo = ErrorRegistry[exception.code];
          message = errorInfo.messageKey;
        }
      } else {
        const errorInfo = ErrorRegistry[exception.code];
        message = errorInfo.messageKey;
      }
      meta = exception.meta;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message =
          (exceptionResponse as { message?: string }).message ||
          exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      code,
      message,
      ...(meta ? { meta } : {}),
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }

  private extractLanguage(request: Request): string {
    const acceptLanguage = request.headers['accept-language'] as string;
    if (acceptLanguage) {
      if (acceptLanguage.includes('tr')) {
        return 'tr';
      }
      if (acceptLanguage.includes('en')) {
        return 'en';
      }
    }
    return 'en';
  }
}
