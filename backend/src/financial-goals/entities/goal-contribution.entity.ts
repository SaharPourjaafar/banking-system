import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { FinancialGoal } from './financial-goal.entity';

@Entity('goal_contributions')
export class GoalContribution {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'date' })
  contributionDate!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => FinancialGoal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goalId' })
  goal!: FinancialGoal;

  @Column()
  goalId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
