import { v4 } from 'uuid';
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

type OutboxMessagePayload = Record<string, any>;
type OutboxMessageMetadata = Record<string, any>;

@Entity('outbox_message')
export class OutboxMessage {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;

  @Column('jsonb', { nullable: false })
  data: {
    payload: OutboxMessagePayload;
    metadata: OutboxMessageMetadata;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'processed_at' })
  processedAt: Date;

  public static create(params: {
    type: OutboxMessage['type'];
    payload: OutboxMessagePayload;
    metadata?: OutboxMessageMetadata;
  }): OutboxMessage {
    const { type, payload, metadata } = params;

    const msg = new OutboxMessage();

    msg.id = v4();
    msg.type = type;
    msg.data = {
      payload: {
        ...payload,
      },
      metadata: {
        ...(metadata || {}),
        version: 1,
      },
    };

    return msg;
  }

  public process() {
    this.processedAt = new Date();
  }

  public get metadata() {
    return this.data.metadata;
  }
}
