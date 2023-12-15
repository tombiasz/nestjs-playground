import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1699364643130 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "tasks" (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            created_by TEXT NOT NULL
        );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tasks`);
  }
}
