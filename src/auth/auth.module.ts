import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { ConfigModule } from '../config/config.module';

@Module({
  controllers: [AuthController],
  imports: [ConfigModule],
  providers: [
    UserProfileService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
