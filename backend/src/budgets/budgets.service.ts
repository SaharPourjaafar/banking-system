import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { CategoriesService } from '../categories/categories.service';
import { UpdateBudgetDto } from './dto/update-budget.dto';

import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,

    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(userId: number, dto: CreateBudgetDto): Promise<Budget> {
    // 1. Validate the date range
    if (dto.startDate > dto.endDate) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    // 2. Ensure the category belongs to the current user
    const category = await this.categoriesService.findOneByUser(
      dto.categoryId,
      userId,
    );

    // 3. Budgets are only allowed for expense categories
    if (String(category.type) !== 'expense') {
      throw new BadRequestException(
        'Budgets can only be created for expense categories',
      );
    }

    // 4. Prevent overlapping budgets for the same category
    const overlappingBudget = await this.budgetsRepository
      .createQueryBuilder('budget')
      .where('budget.userId = :userId', { userId })
      .andWhere('budget.categoryId = :categoryId', {
        categoryId: category.id,
      })
      .andWhere('budget.startDate <= :endDate', {
        endDate: dto.endDate,
      })
      .andWhere('budget.endDate >= :startDate', {
        startDate: dto.startDate,
      })
      .getOne();

    if (overlappingBudget) {
      throw new BadRequestException(
        'An overlapping budget already exists for this category',
      );
    }

    // 5. Create and save the budget
    const budget = this.budgetsRepository.create({
      amount: String(dto.amount),
      startDate: dto.startDate,
      endDate: dto.endDate,
      userId,
      categoryId: category.id,
    });

    return this.budgetsRepository.save(budget);
  }

  // Get all budgets belonging to the current user
  async findAllByUser(userId: number): Promise<Budget[]> {
    return this.budgetsRepository.find({
      where: { userId },
      relations: { category: true },
      order: { startDate: 'DESC' },
    });
  }

  // Get one budget, only if it belongs to the current user
  async findOneByUser(id: number, userId: number): Promise<Budget> {
    const budget = await this.budgetsRepository.findOne({
      where: { id, userId },
      relations: { category: true },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return budget;
  }

  async getSummary(
    id: number,
    userId: number,
  ): Promise<{
    budgetAmount: string;
    spentAmount: string;
    remainingAmount: string;
    spentPercentage: number;
  }> {
    const budget = await this.findOneByUser(id, userId);

    const result = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.categoryId = :categoryId', {
        categoryId: budget.categoryId,
      })
      .andWhere('transaction.type = :type', {
        type: TransactionType.EXPENSE,
      })
      .andWhere('transaction.transactionDate >= :startDate', {
        startDate: budget.startDate,
      })
      .andWhere(
        'transaction.transactionDate < DATE_ADD(:endDate, INTERVAL 1 DAY)',
        {
          endDate: budget.endDate,
        },
      )
      .getRawOne<{ total: string }>();

    const budgetAmount = Number(budget.amount);
    const spentAmount = Number(result?.total ?? 0);
    const remainingAmount = budgetAmount - spentAmount;

    return {
      budgetAmount: budget.amount,
      spentAmount: String(spentAmount),
      remainingAmount: String(remainingAmount),
      spentPercentage:
        budgetAmount > 0
          ? Number(((spentAmount / budgetAmount) * 100).toFixed(2))
          : 0,
    };
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateBudgetDto,
  ): Promise<Budget> {
    // 1. Find the budget and verify ownership
    const budget = await this.findOneByUser(id, userId);

    // 2. Determine the final values after applying the changes
    const startDate = dto.startDate ?? budget.startDate;
    const endDate = dto.endDate ?? budget.endDate;
    const amount = dto.amount ?? Number(budget.amount);
    const categoryId = dto.categoryId ?? budget.categoryId;

    // 3. Validate the date range
    if (startDate > endDate) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    // 4. Verify the category belongs to this user and is an expense category
    const category = await this.categoriesService.findOneByUser(
      categoryId,
      userId,
    );

    if (String(category.type) !== 'expense') {
      throw new BadRequestException(
        'Budgets can only be created for expense categories',
      );
    }

    // 5. Check for overlapping budgets, excluding the current budget
    const overlappingBudget = await this.budgetsRepository
      .createQueryBuilder('budget')
      .where('budget.userId = :userId', { userId })
      .andWhere('budget.categoryId = :categoryId', { categoryId })
      .andWhere('budget.id != :id', { id })
      .andWhere('budget.startDate <= :endDate', { endDate })
      .andWhere('budget.endDate >= :startDate', { startDate })
      .getOne();

    if (overlappingBudget) {
      throw new BadRequestException(
        'An overlapping budget already exists for this category',
      );
    }

    // 6. Apply the changes and save
    budget.amount = String(amount);
    budget.startDate = startDate;
    budget.endDate = endDate;
    budget.categoryId = category.id;

    return this.budgetsRepository.save(budget);
  }

  async remove(id: number, userId: number): Promise<void> {
    // Find the budget and verify ownership
    const budget = await this.findOneByUser(id, userId);

    // Delete the budget
    await this.budgetsRepository.remove(budget);
  }
}
