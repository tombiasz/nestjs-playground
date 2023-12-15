import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../shared/zod-validation.pipe';
import { TasksService } from './tasks.service';
import { CorrelationId } from '../shared/pino-correlation-id.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserCredentials } from '../auth/user-credentials';

const addTaskSchema = z
  .object({
    name: z.string().min(1).max(30),
  })
  .strict()
  .required();

type AddTaskDto = z.infer<typeof addTaskSchema>;

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get('/')
  getTasks() {
    return this.taskService.findAll();
  }

  @Post('/')
  async addTask(
    @Body(new ZodValidationPipe(addTaskSchema)) body: AddTaskDto,
    @CorrelationId() correlationId: string,
    @CurrentUser() user: UserCredentials,
  ) {
    const result = await this.taskService.register(body, {
      correlationId,
      userId: user.id,
    });

    return result;
  }
}
