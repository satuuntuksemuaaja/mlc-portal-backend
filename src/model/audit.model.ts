import {
  Table,
  Column,
  Model,
  Length,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript';
import { Agent } from './agent.model';
import { Client } from './client.model';
import { Organisation } from './organisation.model';

@Table({
  timestamps: false,
  tableName: 'audit'
})
export class Audit extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  id: bigint;

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

  @Length({ max: 64 })
  @Column
  action: string;

  @Column({ type: 'timestamp' })
  time: Date;

  @Column({ type: 'text' })
  details: string;
}
