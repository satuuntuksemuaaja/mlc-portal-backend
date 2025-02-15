import {
  Table,
  Column,
  Model,
  Length,
  BelongsTo,
  HasMany,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  IsUUID
} from 'sequelize-typescript';
import { AgentClient } from './agentclient.model';
import { ClientTerm } from './clientterm.model';
import { Organisation } from './organisation.model';
import { Audit } from './audit.model';

@Table({
  timestamps: true,
  tableName: 'client',
  indexes: [{ fields: ['email'], unique: true }]
})
export class Client extends Model {
  @IsUUID(4)
  @Column({ primaryKey: true })
  id: string;

  @ForeignKey(() => Organisation)
  @Column({ type: 'string' })
  orgId: string;

  @BelongsTo(() => Organisation)
  organisation: Organisation;

  @Column
  serviceId: string;

  @Column
  vaultId: string;

  @Length({ max: 256 })
  @Column
  name: string;

  @Length({ max: 1024 })
  @Column
  email: string;

  @Column
  status: string;

  @Column
  ref: string;

  @Column
  notes: string;

  @Length({ max: 10 })
  @Column
  phone: string;

  @Column
  invitationId: string;

  @Column({ type: 'timestamp' })
  invitationExpiry: Date;

  @Column
  meecoConnectionId: string;

  @Column
  meecoUserId: string;

  @CreatedAt
  @Column({ type: 'timestamp' })
  created: Date;

  @UpdatedAt
  @Column({ type: 'timestamp' })
  lastModified: Date;

  @HasMany(() => ClientTerm)
  clienttrem: ClientTerm;

  @HasMany(() => AgentClient)
  agentclient: AgentClient;

  @HasMany(() => Audit)
  audit: Audit;
}
