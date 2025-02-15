import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  UpdatedAt,
  CreatedAt
} from 'sequelize-typescript';
import { Agent } from './agent.model';
import { Client } from './client.model';

@Table({
  timestamps: true,
  tableName: 'agentclient'
})
export class AgentClient extends Model {
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

  @CreatedAt
  @Column({ type: 'timestamp' })
  created: Date;

  @UpdatedAt
  @Column({ type: 'timestamp' })
  lastModified: Date;
}
