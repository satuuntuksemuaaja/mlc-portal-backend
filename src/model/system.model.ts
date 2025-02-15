import { Table, Column, Model } from 'sequelize-typescript';

@Table({
  timestamps: false,
  tableName: 'system'
})
export class System extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  id: bigint;

  @Column
  up: boolean;
}
