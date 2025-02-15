import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { Agent } from './agent.model';
import { Client } from './client.model';

@Table({
  timestamps: false,
  tableName: 'activities'
})
export class Activities extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  id: bigint;

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

  @Column
  message: string;

  @Column
  title: string;

  @Column
  name: string;

  @Column
  section: string;

  @Column({ type: 'timestamp' })
  created: Date;
}
