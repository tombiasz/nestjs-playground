import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigInjectionTokens } from './config';
import { OutboxModule } from './outbox/outbox.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { pinoLoggerConfigFactory } from './shared/pino-logger-config.factory';
import type { AppConfig, TypeOrmConfig } from './config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigInjectionTokens.AppConfig],
      useFactory: (appConfig: AppConfig) => pinoLoggerConfigFactory(appConfig),
    }),
    AuthModule,
    ConfigModule,
    TasksModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigInjectionTokens.TypeOrmConfig],
      useFactory: (typeOrmConfig: TypeOrmConfig) =>
        typeOrmConfig.asModuleOptions(),
    }),
    OutboxModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
