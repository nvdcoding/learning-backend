import { AdminStatus, Role } from 'src/shares/enum/admin.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'username',
    type: 'varchar',
  })
  username: string;

  @Column({
    name: 'password',
    type: 'varchar',
  })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MOD,
    name: 'role',
    nullable: false,
  })
  role: Role;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AdminStatus,
    nullable: false,
    default: AdminStatus.INACTIVE,
  })
  status: AdminStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
