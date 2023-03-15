import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createCourse: boolean;

  @Column()
  editCourse: boolean;

  @Column()
  deleteCourse: boolean;

  @Column()
  deleteUser: boolean;

  @Column()
  inactiveUser: boolean;

  @Column()
  acceptPost: boolean;

  @Column()
  deletePost: boolean;

  @Column()
  createLesson: boolean;

  @Column()
  editLesson: boolean;

  @Column()
  deleteLesson: boolean;

  @Column()
  createExercise: boolean;

  @Column()
  editExercise: boolean;

  @Column()
  deleteExercise: boolean;
}
