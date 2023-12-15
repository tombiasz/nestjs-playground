import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { SqsModule } from '@ssut/nestjs-sqs';
import { TaskMessageConsumer } from './task-message.consumer';
import { ConfigModule, ConfigInjectionTokens } from '../config';
import type { AwsSqsConfig } from '../config';
import { OutboxModule } from '../outbox/outbox.module';
import { TaskMessagePublisher } from './task-message.publisher';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    OutboxModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigInjectionTokens.AwsSqsConfig],
      useFactory: (awsSqsConfig: AwsSqsConfig) => {
        const { queueUrl, region } = awsSqsConfig;

        return {
          consumers: [
            {
              name: 'taskQueue',
              queueUrl,
              region,
            },
          ],
          producers: [
            {
              name: 'taskQueue',
              queueUrl,
              region,
            },
          ],
        };
      },
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskMessageConsumer, TaskMessagePublisher],
})
export class TasksModule {}
