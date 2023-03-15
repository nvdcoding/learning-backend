import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exercise } from './excercise.entity';

@Entity()
export class TestCase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.testCases)
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column()
  input: string;

  @Column()
  output: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
