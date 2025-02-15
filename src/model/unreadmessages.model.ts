import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript';
import { Agent } from './agent.model';
import { Client } from './client.model';
import { Organisation } from './organisation.model';

@Table({
  timestamps: false,
  tableName: 'unreadmessages'
})
export class UnreadMessages extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  id: bigint;

  @Column({ type: 'string' })
  messageId: string;

  @ForeignKey(() => Organisation)
  @Column({ type: 'string' })
  orgId: string;

  @BelongsTo(() => Organisation)
  organisation: Organisation;

  @ForeignKey(() => Agent)
  @Column({ type: 'string' })
  agentId: string;

  @BelongsTo(() => Agent)
  agent: Agent;

  @ForeignKey(() => Client)
  @Column({ type: 'string' })
  clientId: string;

  @BelongsTo(() => Client)
  client: Client;
}
