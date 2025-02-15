import {
  Table,
  Column,
  Model,
  Length,
  HasMany,
  IsUUID
} from 'sequelize-typescript';
import { Agent } from './agent.model';
import { Audit } from './audit.model';
import { Client } from './client.model';

@Table({
  timestamps: false,
  tableName: 'organisation',
  indexes: [{ fields: ['primaryDomain'], unique: true }]
})
export class Organisation extends Model {
  @IsUUID(4)
  @Column({ primaryKey: true })
  id: string;

  @Column
  serviceId: string;

  @Length({ max: 256 })
  @Column
  name: string;

  @Length({ max: 1024 })
  @Column
  websiteUrl: string;

  @Length({ max: 256 })
  @Column
  primaryDomain: string;

  @Column
  status: string;

  @Column({ type: 'text' })
  logoThumbnail: string;

  @Column({ type: 'text' })
  signupKey: string;

  @Length({ max: 16 })
  @Column
  key: string;

  @Column
  bffRegistered: boolean;

  @Column({ type: 'text' })
  welcomeMessageTemplate: string;

  @HasMany(() => Client)
  clienttrem: Client;

  @HasMany(() => Agent)
  agent: Agent;

  @HasMany(() => Audit)
  audit: Audit;
}
