import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProcessorIdToTasksTable1702562031111
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE "tasks"
                    ADD COLUMN processor_id TEXT DEFAULT NULL
                ;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE "tasks"
                    DROP COLUMN processor_id
                ;
            `);
  }
}
