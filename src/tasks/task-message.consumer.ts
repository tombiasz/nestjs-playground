import { Message } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskMessage } from './task-message';
import { PinoLogger } from 'nestjs-pino';

const isObject = (value: unknown): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

@Injectable()
export class TaskMessageConsumer {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TaskMessageConsumer.name);
  }

  @SqsMessageHandler('taskQueue')
  public async handleMessage(message: Message) {
    const awsMsgId = message.MessageId;

    this.logger.info({ awsMsgId }, 'processing message from task queue');

    if (!message.Body) {
      this.logger.error(
        { awsMsgId },
        'failed to process a message from task queue. No message body',
      );
      throw new TypeError(`received message (id ${awsMsgId}) without body`);
    }

    const body = JSON.parse(message.Body);

    if (!isObject(body)) {
      this.logger.error(
        { awsMsgId },
        'failed to process a message from task queue. Message body is not an object',
      );
      throw new TypeError(
        `received message (id ${awsMsgId}) which body is not an object`,
      );
    }

    const msg = TaskMessage.fromRawObject(body);
    this.logger.debug(
      { awsMsgId, taskId: msg.taskId, ...msg.metadata },
      'task message extracted from message',
    );

    const task = await this.tasksRepository.findOneBy({ id: msg.taskId });

    if (!task) {
      this.logger.error(
        { awsMsgId, taskId: msg.taskId, ...msg.metadata },
        'failed to process a message from task queue. Could not retrieve task entity specified in message',
      );
      throw new Error(`task (id: ${msg.taskId})  could not be found`);
    }

    this.logger.debug(
      { awsMsgId, taskId: task.id, ...msg.metadata },
      'marking task as finished',
    );
    task.finish();
    await this.tasksRepository.update({ id: task.id }, task);

    this.logger.info(
      { awsMsgId, taskId: task.id, ...msg.metadata },
      'task processed successfully',
    );
  }

  @SqsConsumerEventHandler('taskQueue', 'processing_error')
  public onProcessingError(error: Error, message: Message) {
    console.error('error processing sqs msg: ');
    console.error({ error, message });
  }
}
