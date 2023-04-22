import {
  CourseLanguage,
  CourseLevel,
  CourseStatus,
  CourseType,
  Path,
} from 'src/shares/enum/course.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { UserCourse } from './user-course.entity';

@Entity()
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
  })
  name: string;

  @Column({
    type: 'text',
    name: 'description',
  })
  description: string;

  @Column({
    name: 'goal',
    type: 'text',
  })
  goal: string;

  @Column({
    name: 'language',
    type: 'enum',
    enum: CourseLanguage,
    nullable: false,
  })
  language: CourseLanguage;

  @Column({
    name: 'level',
    type: 'enum',
    enum: CourseLevel,
    nullable: false,
    default: CourseLevel.BEGIN,
  })
  level: CourseLevel;

  @Column({
    type: 'varchar',
    name: 'img',
  })
  img: string;

  @Column({
    type: 'enum',
    enum: Path,
    default: Path.BASIC,
  })
  path: Path;

  @Column({
    name: 'requirement',
    type: 'text',
  })
  requirement: string;

  @Column({
    name: 'price',
    type: 'integer',
  })
  price: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: CourseType,
  })
  type: CourseType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.ACTIVE,
    nullable: false,
  })
  status: CourseStatus;

  @OneToMany(() => UserCourse, (UserCourse) => UserCourse.course)
  userCourses: UserCourse[];

  @OneToMany(() => Lesson, (Lesson) => Lesson.course)
  lessons: Lesson[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
