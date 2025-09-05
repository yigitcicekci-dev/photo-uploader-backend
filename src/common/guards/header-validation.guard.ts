import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppLanguages, AppLanguageConvert, OsType } from '../types/core.types';
import { SKIP_HEADER_VALIDATION_KEY } from '../decorators/skip-header-validation.decorator';
import { HEADER_VALIDATION_GUARD_CUSTOM_EXCLUDED_ROUTES } from '../config/route.config';

interface RequestWithRoute {
  route?: {
    path: string;
  };
  headers: {
    os?: string;
    model?: string;
    version?: string;
    'device-id'?: string;
    'accept-language'?: string;
    [key: string]: string | string[] | undefined;
  };
}

@Injectable()
export class HeaderValidationGuard implements CanActivate {
  private static readonly ALLOWED_OS = [OsType.ANDROID, OsType.IOS, OsType.WEB];

  private static readonly ALLOWED_LANGUAGES = [
    AppLanguages.English,
    AppLanguages.Turkish,
  ];

  private static readonly REQUIRED_HEADERS = [
    'os',
    'model',
    'version',
    'device-id',
    'accept-language',
  ];

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

    const os = headers.os;
    if (!HeaderValidationGuard.ALLOWED_OS.includes(os as OsType))
      this.fail(`Invalid os header: received '${os}'`);

    const deviceId = headers['device-id'];
    if (typeof deviceId !== 'string' || !deviceId.trim())
      this.fail(`Invalid device-id header: received '${deviceId}'`);

    const model = headers.model;
    if (typeof model !== 'string' || !model.trim())
      this.fail(`Invalid model header: received '${model}'`);

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

    const version = headers.version;
    if (typeof version !== 'string' || !version.trim())
      this.fail(`Invalid version header: received '${version}'`);

    return true;
  }
}
