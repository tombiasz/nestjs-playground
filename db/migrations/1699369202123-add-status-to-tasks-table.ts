import { MigrationInterface, QueryRunner } from 'typeorm';
import { TaskStatus } from '../../src/tasks/task.entity';

export class AddStatusToTasksTable1699369202123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "tasks"
            ADD COLUMN status TEXT NOT NULL DEFAULT '${TaskStatus.Received}'
        ;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "tasks"
            DROP COLUMN status 
        ;
    `);
  }
}
