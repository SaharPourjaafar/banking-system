import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinancialGoal,
  FinancialGoalStatus,
} from './entities/financial-goal.entity';
import { GoalContribution } from './entities/goal-contribution.entity';

import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Injectable()
export class FinancialGoalsService {
  constructor(
    @InjectRepository(FinancialGoal)
    private readonly goalsRepository: Repository<FinancialGoal>,

    @InjectRepository(GoalContribution)
    private readonly contributionsRepository: Repository<GoalContribution>,
  ) {}

  // Create a financial goal for the current user
  async create(userId: number, dto: CreateGoalDto): Promise<FinancialGoal> {
    const goal = this.goalsRepository.create({
      title: dto.title,
      targetAmount: String(dto.targetAmount),
      deadline: dto.deadline,
      description: dto.description ?? null,
      userId,
    });

    return this.goalsRepository.save(goal);
  }

  // Get all financial goals belonging to the current user
  async findAllByUser(userId: number): Promise<FinancialGoal[]> {
    return this.goalsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get one financial goal, only if it belongs to the current user
  async findOneByUser(id: number, userId: number): Promise<FinancialGoal> {
    const goal = await this.goalsRepository.findOne({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Financial goal not found');
    }

    return goal;
  }

  async getSummary(
    id: number,
    userId: number,
  ): Promise<{
    targetAmount: string;
    savedAmount: string;
    remainingAmount: string;
    progressPercentage: number;
    status: string;
  }> {
    // 1. Find the goal and verify ownership
    const goal = await this.findOneByUser(id, userId);

    // 2. Calculate the total contributions
    const result = await this.contributionsRepository
      .createQueryBuilder('contribution')
      .select('COALESCE(SUM(contribution.amount), 0)', 'total')
      .where('contribution.goalId = :goalId', {
        goalId: goal.id,
      })
      .getRawOne<{ total: string }>();

    // 3. Calculate the financial summary
    const targetAmount = Number(goal.targetAmount);
    const savedAmount = Number(result?.total ?? 0);
    const remainingAmount = Math.max(targetAmount - savedAmount, 0);

    const progressPercentage =
      targetAmount > 0
        ? Number(Math.min((savedAmount / targetAmount) * 100, 100).toFixed(2))
        : 0;

    return {
      targetAmount: goal.targetAmount,
      savedAmount: String(savedAmount),
      remainingAmount: String(remainingAmount),
      progressPercentage,
      status: goal.status,
    };
  }

  async addContribution(
    id: number,
    userId: number,
    dto: CreateContributionDto,
  ): Promise<GoalContribution> {
    // Find the goal and verify its ownership
    const goal = await this.findOneByUser(id, userId);

    // Check whether the goal is already completed
    if (goal.status === FinancialGoalStatus.COMPLETED) {
      throw new BadRequestException('This financial goal is already completed');
    }

    // Get all contributions belonging to this goal
    const contributions = await this.contributionsRepository.find({
      where: { goalId: goal.id },
    });

    // Calculate the total saved amount
    const savedAmount = contributions.reduce(
      (total, contribution) => total + Number(contribution.amount),
      0,
    );

    const targetAmount = Number(goal.targetAmount);
    const contributionAmount = dto.amount;

    // Check whether the contribution exceeds the remaining amount
    if (savedAmount + contributionAmount > targetAmount) {
      throw new BadRequestException(
        'Contribution exceeds the remaining goal amount',
      );
    }

    // Create a new contribution
    const contribution = this.contributionsRepository.create({
      amount: String(contributionAmount),
      contributionDate: dto.contributionDate,
      note: dto.note ?? null,
      goalId: goal.id,
    });

    // Save the contribution
    const savedContribution =
      await this.contributionsRepository.save(contribution);

    // Update goal status if the target amount has been reached
    const newSavedAmount = savedAmount + contributionAmount;

    if (newSavedAmount >= targetAmount) {
      goal.status = FinancialGoalStatus.COMPLETED;

      await this.goalsRepository.save(goal);
    }

    return savedContribution;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateGoalDto,
  ): Promise<FinancialGoal> {
    const goal = await this.findOneByUser(id, userId);

    if (dto.targetAmount !== undefined) {
      const result = await this.contributionsRepository
        .createQueryBuilder('contribution')
        .select('COALESCE(SUM(contribution.amount), 0)', 'total')
        .where('contribution.goalId = :goalId', { goalId: id })
        .getRawOne<{ total: string }>();

      const savedAmount = Number(result?.total ?? 0);

      if (dto.targetAmount < savedAmount) {
        throw new BadRequestException(
          'Target amount cannot be less than the saved amount',
        );
      }
    }

    Object.assign(goal, dto);

    const result = await this.contributionsRepository
      .createQueryBuilder('contribution')
      .select('COALESCE(SUM(contribution.amount), 0)', 'total')
      .where('contribution.goalId = :goalId', { goalId: id })
      .getRawOne<{ total: string }>();

    const savedAmount = Number(result?.total ?? 0);
    const targetAmount = Number(goal.targetAmount);

    goal.status =
      savedAmount >= targetAmount
        ? FinancialGoalStatus.COMPLETED
        : FinancialGoalStatus.ACTIVE;

    return this.goalsRepository.save(goal);
  }

  async remove(id: number, userId: number): Promise<void> {
    const goal = await this.findOneByUser(id, userId);

    await this.goalsRepository.remove(goal);
  }
}
