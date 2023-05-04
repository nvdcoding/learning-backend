import {
  TransactionStatus,
  TransactionType,
  Wallet,
} from 'src/shares/enum/transaction.enum';
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
import { User } from './user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_code', type: 'varchar', nullable: true })
  transactionCode: string;

  @Column({
    type: 'enum',
    enum: Wallet,
    name: 'wallet',
    nullable: false,
    default: Wallet.VNPAY,
  })
  wallet: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    name: 'type',
    nullable: false,
  })
  type: TransactionType;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'datetime',
    name: 'time',
  })
  time: Date;

  @Column({
    name: 'amount',
    type: 'int',
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'enum',
    name: 'status',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
    nullable: false,
  })
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
