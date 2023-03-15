import { ReportStatus } from 'src/shares/enum/report.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.reports)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({
    name: 'reason',
    type: 'text',
  })
  reason: string;

  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: 'reported_by' })
  reportedBy: User;

  @Column({
    type: 'enum',
    name: 'status',
    nullable: false,
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
