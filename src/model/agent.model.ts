import {
  Table,
  Column,
  Model,
  Length,
  ForeignKey,
  HasMany,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  IsUUID
} from 'sequelize-typescript';
import { AgentClient } from './agentclient.model';
import { Audit } from './audit.model';
import { Organisation } from './organisation.model';
import { Roles } from './roles.model';

@Table({
  timestamps: true,
  tableName: 'agent',
  indexes: [{ fields: ['email'], unique: true }]
})
export class Agent extends Model {
  @IsUUID(4)
  @Column({ primaryKey: true })
  id: string;

  @ForeignKey(() => Roles)
  @Column({ type: 'integer' })
  roleId: number;

  @BelongsTo(() => Roles)
  role: Roles;

  @ForeignKey(() => Organisation)
  @Column({ type: 'string' })
  orgId: string;

  @BelongsTo(() => Organisation)
  organisation: Organisation;

  @Length({ max: 256 })
  @Column
  name: string;

  @Length({ max: 1024 })
  @Column
  email: string;

  @Column
  status: string;

  @Column({ type: 'text' })
  photo: string;

  @CreatedAt
  @Column({ type: 'timestamp' })
  created: Date;

  @UpdatedAt
  @Column({ type: 'timestamp' })
  lastModified: Date;

  @Length({ max: 10 })
  @Column
  phone: string;

  @HasMany(() => AgentClient)
  agentclient: AgentClient;

  @HasMany(() => Audit)
  audit: Audit;
}
