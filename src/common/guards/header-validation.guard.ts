import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppLanguages, AppLanguageConvert } from '../types/core.types';
import { SKIP_HEADER_VALIDATION_KEY } from '../decorators/skip-header-validation.decorator';
import { HEADER_VALIDATION_GUARD_CUSTOM_EXCLUDED_ROUTES } from '../config/route.config';

interface RequestWithRoute {
  route?: {
    path: string;
  };
  headers: {
    'device-id'?: string;
    'accept-language'?: string;
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
}

@Injectable()
export class HeaderValidationGuard implements CanActivate {
  private static readonly ALLOWED_LANGUAGES = [
    AppLanguages.English,
    AppLanguages.Turkish,
  ];

  private static readonly REQUIRED_HEADERS = ['device-id', 'accept-language'];

  private readonly logger = new Logger('HEADER_VALIDATION_GUARD');

  constructor(private reflector: Reflector) {}

  private fail(reason: string): never {
    this.logger.error(reason);
    throw new BadRequestException('Invalid or missing headers');
  }

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_HEADER_VALIDATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skip) return true;

    const request = context.switchToHttp().getRequest<RequestWithRoute>();
    const path = request?.route?.path;

    if (typeof path === 'string') {
      const excludedRoutes: readonly string[] =
        HEADER_VALIDATION_GUARD_CUSTOM_EXCLUDED_ROUTES;
      if (excludedRoutes.includes(path)) {
        return true;
      }
    }

    const headers = request.headers;
    const missing = HeaderValidationGuard.REQUIRED_HEADERS.filter(
      (h) => !headers[h],
    );

    if (missing.length)
      this.fail(`Missing required headers: ${missing.join(', ')}`);

    const deviceId = headers['device-id'];
    if (typeof deviceId !== 'string' || !deviceId.trim())
      this.fail(`Invalid device-id header: received '${deviceId}'`);

    const lang = headers['accept-language'];
    if (typeof lang !== 'string') {
      this.fail(`Invalid accept-language header: received '${lang}'`);
    }

    const parsedLang = AppLanguageConvert[lang];
    const isValidLang =
      HeaderValidationGuard.ALLOWED_LANGUAGES.includes(parsedLang);
    if (!isValidLang) {
      this.fail(`Invalid accept-language header: received '${lang}'`);
    }
    request.headers['accept-language'] = parsedLang;

    return true;
  }
}
