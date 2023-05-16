import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserLesson } from './user-lesson.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'seconds',
    type: 'int',
    nullable: true,
  })
  seconds: number;

  @Column({
    name: 'notes',
    type: 'text',
  })
  notes: string;

  @ManyToOne(() => UserLesson, (userLesson) => userLesson.notes)
  @JoinColumn({ name: 'note' })
  userLesson: UserLesson;
}
