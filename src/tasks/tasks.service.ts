import { Injectable } from '@nestjs/common';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OutboxMessage } from '../outbox/outbox-message.entity';
import { TaskMessage } from './task-message';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private dataSource: DataSource,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TasksService.name);
  }

  findAll(): Promise<Task[]> {
    this.logger.debug('getting all tasks');

    return this.tasksRepository.find({
      order: {
        createdAt: {
          direction: 'DESC',
        },
      },
    });
  }

  async register(
    data: { name: string },
    metadata: { correlationId: string; userId: string },
  ): Promise<Task> {
    this.logger.info(metadata, 'registering new task');

    const task = Task.received({ name: data.name, createdBy: metadata.userId });
    const msg = TaskMessage.fromTask(task, {
      correlationId: metadata.correlationId,
      scheduledBy: metadata.userId,
    });
    const outboxMsg = msg.toOutboxMessage();

    await this.dataSource.transaction(async (manager) => {
      await manager.insert(Task, task);
      await manager.insert(OutboxMessage, outboxMsg);
    });

    this.logger.info(
      { taskId: task.id, msgId: outboxMsg.id, ...metadata },
      'new task registered',
    );

    return task;
  }
}
