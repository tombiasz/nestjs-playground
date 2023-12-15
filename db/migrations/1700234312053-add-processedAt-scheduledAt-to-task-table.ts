import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProcessedAtScheduledAtToTaskTable1700234312053
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tasks"
                ADD COLUMN processed_at TIMESTAMPTZ NULL DEFAULT NULL,
                ADD COLUMN scheduled_at TIMESTAMPTZ NULL DEFAULT NULL
            ;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tasks"
                DROP COLUMN processed_at,
                DROP COLUMN scheduled_at
            ;
        `);
  }
}
