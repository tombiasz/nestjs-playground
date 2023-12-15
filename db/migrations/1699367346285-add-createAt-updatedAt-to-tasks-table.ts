import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreateAtUpdatedAtToTasksTable1699367346285
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "tasks"
            ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        ;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "tasks"
            DROP COLUMN created_at,
            DROP COLUMN updated_at
        ;
    `);
  }
}
