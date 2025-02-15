import {
  Table,
  Column,
  Model,
  ForeignKey,
  HasMany,
  BelongsTo
} from 'sequelize-typescript';
import { Agent } from './agent.model';
import { Organisation } from './organisation.model';

@Table({
  timestamps: false,
  tableName: 'role'
})
export class Roles extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  id: number;

  @Column
  name: string;

  @ForeignKey(() => Organisation)
  @Column({ type: 'string' })
  orgId: string;

  @BelongsTo(() => Organisation)
  organisation: Organisation;

  @HasMany(() => Agent)
  agent: Agent;
}
