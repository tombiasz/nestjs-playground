import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxMessage } from './outbox-message.entity';
import { OutboxMessageService } from './outbox-message.service';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxMessage])],
  providers: [OutboxMessageService],
  exports: [TypeOrmModule, OutboxMessageService],
})
export class OutboxModule {}
