import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';
import { AppConfig, ConfigInjectionTokens } from './config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(ConfigInjectionTokens.AppConfig) appConfig: AppConfig,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
