import { OutboxMessage } from '../outbox/outbox-message.entity';
import { Task } from './task.entity';
import { z } from 'zod';

type TaskMessagePayload = {
  taskId: Task['id'];
};

type TaskMessageMetadata = {
  version: 1;
  correlationId: string;
  scheduledBy: string;
};

type TaskMessageProps = {
  payload: TaskMessagePayload;
  metadata: TaskMessageMetadata;
};

const schema: z.ZodType<TaskMessageProps> = z.object({
  payload: z.object({
    taskId: z.string().uuid(),
  }),
  metadata: z.object({
    version: z.literal(1),
    correlationId: z.string().uuid(), // CorrelationId type with defined validation schema would be nice here
    scheduledBy: z.string(),
  }),
});

export class TaskMessage {
  private constructor(private props: TaskMessageProps) {}

  static fromTask(
    task: Task,
    metadata: { correlationId: string; scheduledBy: string },
  ): TaskMessage {
    return new TaskMessage({
      payload: {
        taskId: task.id,
      },
      metadata: { version: 1, ...metadata },
    });
  }

  static fromRawObject(obj: Record<string, any>) {
    const result = schema.safeParse(obj);

    if (!result.success) {
      throw new TypeError(
        JSON.stringify(
          {
            message: 'Task message could not be parsed. Invalid message body.',
            issues: result.error.issues,
          },
          null,
          2,
        ),
      );
    }

    const { payload, metadata } = result.data;

    return new TaskMessage({ payload, metadata });
  }

  public toOutboxMessage(): OutboxMessage {
    const { payload, metadata } = this.props;
    return OutboxMessage.create({
      type: 'task',
      payload: payload,
      metadata: metadata,
    });
  }

  public get taskId() {
    return this.props.payload.taskId;
  }

  public get metadata() {
    return this.props.metadata;
  }
}
