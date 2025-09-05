import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipHeaderValidation } from './common/decorators/skip-header-validation.decorator';

@ApiTags('Application')
@Controller()
@SkipHeaderValidation()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application info' })
  @ApiResponse({
    status: 200,
    description: 'Application info retrieved successfully',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
