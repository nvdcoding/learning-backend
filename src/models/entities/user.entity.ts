import { UserStatus } from 'src/shares/enum/user.enum';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Transaction } from './transaction.entity';
import { Report } from './report.entity';
import { Comment } from './comment.entity';
import { UserLesson } from './user-lesson.entity';
import { UserExercise } from './user-excercise.entity';
import { UserCourse } from './user-course.entity';
import { UserPrefer } from './user-prefer.entity';
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'password' })
  password: string;

  @Index()
  @Column({ nullable: false, name: 'email' })
  email: string;

  @Index()
  @Column({ nullable: false, name: 'username' })
  username: string;

  @Index()
  @Column({ nullable: true, name: 'name', type: 'varchar' })
  name: string;

  @Column({ nullable: true, name: 'avatar', type: 'varchar' })
  avatar: string;

  @Column({
    type: 'int',
    default: 0,
    name: 'coin',
    unsigned: true,
  })
  coin: number;

  @Column({
    type: 'int',
    default: 0,
    name: 'coin_available',
    unsigned: true,
  })
  coinAvailable: number;

  @Column({
    nullable: false,
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  verifyStatus: UserStatus;

  @Column({
    nullable: true,
    name: 'isSetup',
    type: 'boolean',
  })
  isSetup: boolean;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Report, (report) => report.reportedBy)
  reports: Report[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => UserLesson, (userLesson) => userLesson.user)
  userLessons: UserLesson[];

  @OneToMany(() => UserExercise, (UserExercise) => UserExercise.user)
  userExercises: UserExercise[];

  @OneToMany(() => UserCourse, (UserCourse) => UserCourse.user)
  userCourses: UserCourse[];

  @OneToOne(() => UserPrefer)
  @JoinColumn()
  userPrefer: UserPrefer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
