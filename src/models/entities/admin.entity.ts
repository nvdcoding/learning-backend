import { AdminRole, AdminStatus, Role } from 'src/shares/enum/admin.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Permission } from './permission.entity';

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
    enum: AdminRole,
    default: AdminRole.MOD,
    name: 'role',
    nullable: false,
  })
  role: AdminRole;

  @Column({
    name: 'email',
    type: 'varchar',
  })
  email: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AdminStatus,
    nullable: false,
    default: AdminStatus.INACTIVE,
  })
  status: AdminStatus;

  @ManyToOne(() => Permission, (permission) => permission.admins)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
