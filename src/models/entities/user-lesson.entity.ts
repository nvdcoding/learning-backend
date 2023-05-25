import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { Note } from './note.entity';

@Entity()
export class UserLesson {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.userLessons)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => User, (user) => user.userLessons)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Note, (note) => note.userLesson)
  notes: Note[];

  @Column({
    name: 'comments',
    type: 'text',
  })
  comments: string;

  @Column({ name: 'is_done_exercise', nullable: true })
  isDone: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
