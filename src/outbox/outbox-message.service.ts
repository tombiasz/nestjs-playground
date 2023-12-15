import { Injectable } from '@nestjs/common';
import { OutboxMessage } from './outbox-message.entity';
import { DataSource, EntityManager } from 'typeorm';

const MAX_MESSAGES_TO_PUBLISH = 1000;

@Injectable()
export class OutboxMessageService {
  constructor(private dataSource: DataSource) {}

  async process(params: {
    type: OutboxMessage['type'];
    callback: (
      manager: EntityManager,
      selectedMessage: Readonly<OutboxMessage>,
    ) => Promise<void>;
  }): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    for (let i = 0; i < MAX_MESSAGES_TO_PUBLISH; i++) {
      await queryRunner.startTransaction();

      try {
        const msg = await queryRunner.manager
          .getRepository(OutboxMessage)
          .createQueryBuilder()
          .select()
          .where('processed_at IS NULL')
          .andWhere('type = :type', { type: params.type })
          .setLock('pessimistic_write')
          .setOnLocked('skip_locked')
          .limit(1)
          .getOne();

        if (!msg) {
          // nothing to do
          await queryRunner.rollbackTransaction();

          break;
        }

        await params.callback(queryRunner.manager, msg);

        msg.process();

        await queryRunner.manager.update(OutboxMessage, { id: msg.id }, msg);

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      }
    }

    await queryRunner.release();
  }
}
