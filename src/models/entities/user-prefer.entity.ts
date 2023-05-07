import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Admin } from './admin.entity';
import { User } from './user.entity';

@Entity({ name: 'user_prefer' })
export class UserPrefer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'course_basic', type: 'boolean' })
  courseBasic: boolean;

  @Column({ nullable: false, name: 'course_backend', type: 'boolean' })
  courseBackend: boolean;

  @Column({ nullable: false, name: 'course_mobile', type: 'boolean' })
  courseMobile: boolean;

  @Column({ nullable: false, name: 'course_frontend', type: 'boolean' })
  courseFrontend: boolean;

  @Column({ nullable: false, name: 'course_fullstack', type: 'boolean' })
  courseFullstack: boolean;

  @Column({ nullable: false, name: 'course_other', type: 'boolean' })
  courseOther: boolean;

  @Column({ nullable: false, name: 'topic_backend', type: 'boolean' })
  topicBackend: boolean;

  @Column({ nullable: false, name: 'topic_frontend', type: 'boolean' })
  topicFrontEnd: boolean;

  @Column({ nullable: false, name: 'topic_basic', type: 'boolean' })
  topicBasic: boolean;

  @Column({ nullable: false, name: 'topic_mobile', type: 'boolean' })
  topicMobile: boolean;

  @Column({ nullable: false, name: 'topic_devops', type: 'boolean' })
  topicsDevops: boolean;

  @Column({ nullable: false, name: 'topic_other', type: 'boolean' })
  topicOther: boolean;
}
