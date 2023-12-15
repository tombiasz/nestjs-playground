import { v4 } from 'uuid';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TaskStatus {
  Received = 'received',
  Processing = 'processing',
  Finished = 'finished',
}

@Entity('tasks')
export class Task {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ name: 'created_by' })
  createdBy: string; // UserId type would be nice

  @Column({ name: 'processor_id' })
  processorId: string;

  @Column('text')
  status: TaskStatus;

  @Column('timestamptz', { name: 'processed_at' })
  processedAt: Date;

  @Column('timestamptz', { name: 'scheduled_at' })
  scheduledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  static received(data: {
    name: Task['name'];
    createdBy: Task['createdBy'];
  }): Task {
    // silly typeorm
    const task = new Task();

    task.id = v4();
    task.status = TaskStatus.Received;
    task.name = data.name;
    task.createdBy = data.createdBy;

    return task;
  }

  public processing(data: { processorId: Task['processorId'] }) {
    if (this.status !== TaskStatus.Received) {
      throw new TypeError(
        `Task (id: ${this.id}) cannot be finished. Invalid status. Expected: ${TaskStatus.Received}. Got: ${this.status}`,
      );
    }

    this.scheduledAt = new Date();
    this.status = TaskStatus.Processing;
    this.processorId = data.processorId;
  }

  public finish() {
    if (this.status !== TaskStatus.Processing) {
      throw new TypeError(
        `Task (id: ${this.id}) cannot be finished. Invalid status. Expected: ${TaskStatus.Received}. Got: ${this.status}`,
      );
    }

    this.processedAt = new Date();
    this.status = TaskStatus.Finished;
  }
}
