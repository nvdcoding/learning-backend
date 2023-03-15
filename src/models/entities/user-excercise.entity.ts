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
import { User } from './user.entity';

@Entity()
export class UserExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.userExercises)
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @ManyToOne(() => User, (user) => user.userExercises)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'longtext',
    name: 'answer',
    nullable: false,
  })
  answer: string;

  @Column()
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
