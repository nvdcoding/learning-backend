import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { TestCase } from './testcase.entity';
import { UserExercise } from './user-excercise.entity';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.exercises)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({
    name: 'question',
    type: 'text',
  })
  question: string;

  @Column({
    name: 'description',
    type: 'text',
  })
  description: string;

  @OneToMany(() => UserExercise, (userExercise) => userExercise.exercise)
  userExercises: [];

  @OneToMany(() => TestCase, (testCase) => testCase.exercise, { cascade: true })
  testCases: [];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
