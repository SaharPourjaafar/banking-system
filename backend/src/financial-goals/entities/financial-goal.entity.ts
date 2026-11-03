import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum FinancialGoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('financial_goals')
export class FinancialGoal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  targetAmount!: string;

  @Column({ type: 'date' })
  deadline!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: FinancialGoalStatus,
    default: FinancialGoalStatus.ACTIVE,
  })
  status!: FinancialGoalStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
