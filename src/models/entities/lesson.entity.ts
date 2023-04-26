import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Comment } from './comment.entity';
import { Course } from './course.entity';
import { Exercise } from './excercise.entity';
import { UserLesson } from './user-lesson.entity';

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
  })
  name: string;

  @Column({
    name: 'link',
    type: 'varchar',
  })
  link: string;

  @ManyToOne(() => Course, (course) => course.lessons, { eager: true })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => Exercise, (exercise) => exercise.lesson)
  exercises: Exercise[];

  @OneToMany(() => Comment, (Comment) => Comment.lesson)
  comments: Comment[];

  @OneToMany(() => UserLesson, (userLesson) => userLesson.lesson)
  userLessons: UserLesson[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
