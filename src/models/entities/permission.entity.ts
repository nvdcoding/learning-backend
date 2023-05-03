import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Admin } from './admin.entity';

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'level', type: 'int' })
  level: number;

  @Column({ nullable: false, name: 'posts', type: 'boolean' })
  post: boolean;

  @Column({ nullable: false, name: 'reports', type: 'boolean' })
  report: boolean;

  @Column({ nullable: false, name: 'users', type: 'boolean' })
  user: boolean;

  @Column({ nullable: false, name: 'exercise', type: 'boolean' })
  exercise: boolean;

  @Column({ nullable: false, name: 'lesson', type: 'boolean' })
  lesson: boolean;

  @Column({ nullable: false, name: 'course', type: 'boolean' })
  course: boolean;

  @OneToMany(() => Admin, (admin) => admin.permission)
  admins: Admin[];
}
