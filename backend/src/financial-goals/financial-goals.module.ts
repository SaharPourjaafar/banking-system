import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FinancialGoalsService } from './financial-goals.service';
import { FinancialGoalsController } from './financial-goals.controller';

import { FinancialGoal } from './entities/financial-goal.entity';
import { GoalContribution } from './entities/goal-contribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialGoal, GoalContribution])],
  providers: [FinancialGoalsService],
  controllers: [FinancialGoalsController],
})
export class FinancialGoalsModule {}
