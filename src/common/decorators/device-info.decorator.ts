import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DeviceInfo } from '../types/core.types';

interface RequestWithDeviceHeaders {
  headers: {
    os: string;
    model: string;
    version: string;
    'device-id': string;
    [key: string]: string | string[] | undefined;
  };
}

export const DeviceInfoDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DeviceInfo => {
    const req = ctx.switchToHttp().getRequest<RequestWithDeviceHeaders>();
    return {
      os: req.headers.os as DeviceInfo['os'],
      model: req.headers.model,
      version: req.headers.version,
      deviceId: req.headers['device-id'],
    };
  },
);
