import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  CreatedAt
} from 'sequelize-typescript';
import { Client } from './client.model';

@Table({
  timestamps: true,
  tableName: 'clientterm',
  updatedAt: false
})
export class ClientTerm extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  id: bigint;

  @ForeignKey(() => Client)
  @Column({ type: 'string' })
  clientId: string;

  @BelongsTo(() => Client)
  client: Client;

  @Column({ type: 'timestamp' })
  start: Date;

  @Column({ type: 'timestamp' })
  end: Date;

  @Column({ type: 'integer' })
  durationMonths: number;

  @Column
  createdBy: string;

  @Column
  status: string;

  @CreatedAt
  @Column({ type: 'timestamp' })
  created: Date;
}
