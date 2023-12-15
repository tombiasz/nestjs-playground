import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxMessageService } from '../outbox/outbox-message.service';
import { SqsService } from '@ssut/nestjs-sqs';
import { TaskMessage } from './task-message';
import { Task } from './task.entity';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TaskMessagePublisher {
  constructor(
    private outboxMessageService: OutboxMessageService,
    private readonly sqsService: SqsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TaskMessagePublisher.name);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async publish() {
    await this.outboxMessageService.process({
      type: 'task',
      callback: async (manager, msg) => {
        this.logger.debug(
          { msgId: msg.id, ...msg.metadata },
          'publishing message to task queue',
        );

        const taskMessage = TaskMessage.fromRawObject(msg.data);
        const task = await manager.findOneBy(Task, { id: taskMessage.taskId });
        if (!task) {
          this.logger.error(
            { msgId: msg.id, ...taskMessage.metadata },
            'failed to publish a message to task queue. Task not found',
          );
          throw new Error(`task (id ${taskMessage.taskId}) not found`);
        }

        this.logger.debug(
          { msgId: msg.id, taskId: task.id, ...taskMessage.metadata },
          'sending task to queue',
        );
        const result = await this.sqsService.send('taskQueue', {
          id: msg.id,
          body: msg.data,
        });
        const awsMsgId = result[0].MessageId || 'empty-aws-msg-id'; // why it can be undefined?

        this.logger.debug(
          {
            msgId: msg.id,
            taskId: task.id,
            awsMsgId,
            ...taskMessage.metadata,
          },
          'task published to queue',
        );

        this.logger.debug(
          { taskId: task.id, awsMsgId, ...taskMessage.metadata },
          'marking task as processing',
        );
        task.processing({ processorId: awsMsgId });
        await manager.update(Task, { id: task.id }, task);
      },
    });
  }
}
