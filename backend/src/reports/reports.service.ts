import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async getSummary(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<{
    startDate: string;
    endDate: string;
    totalIncome: string;
    totalExpense: string;
    balance: string;
  }> {
    if (startDate > endDate) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    const result = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select(
        `COALESCE(SUM(
          CASE
            WHEN transaction.type = :incomeType
            THEN transaction.amount
            ELSE 0
          END
        ), 0)`,
        'totalIncome',
      )
      .addSelect(
        `COALESCE(SUM(
          CASE
            WHEN transaction.type = :expenseType
            THEN transaction.amount
            ELSE 0
          END
        ), 0)`,
        'totalExpense',
      )
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.transactionDate >= :startDate', {
        startDate,
      })
      .andWhere(
        'transaction.transactionDate < DATE_ADD(:endDate, INTERVAL 1 DAY)',
        { endDate },
      )
      .setParameters({
        incomeType: TransactionType.INCOME,
        expenseType: TransactionType.EXPENSE,
      })
      .getRawOne<{
        totalIncome: string | null;
        totalExpense: string | null;
      }>();

    const totalIncome = Number(result?.totalIncome ?? 0);
    const totalExpense = Number(result?.totalExpense ?? 0);

    return {
      startDate,
      endDate,
      totalIncome: String(totalIncome),
      totalExpense: String(totalExpense),
      balance: String(totalIncome - totalExpense),
    };
  }

  async getMonthlyReport(
    userId: number,
    year: number,
    month: number,
  ): Promise<{
    year: number;
    month: number;
    totalIncome: string;
    totalExpense: string;
    balance: string;
  }> {
    if (
      !Number.isInteger(year) ||
      year < 1000 ||
      year > 9999 ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      throw new BadRequestException('Year or month is invalid');
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

    const endDate = new Date(Date.UTC(year, month, 1))
      .toISOString()
      .slice(0, 10);

    const result = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select(
        `COALESCE(SUM(
          CASE
            WHEN transaction.type = :incomeType
            THEN transaction.amount
            ELSE 0
          END
        ), 0)`,
        'totalIncome',
      )
      .addSelect(
        `COALESCE(SUM(
          CASE
            WHEN transaction.type = :expenseType
            THEN transaction.amount
            ELSE 0
          END
        ), 0)`,
        'totalExpense',
      )
      .where('transaction.userId = :userId', {
        userId,
      })
      .andWhere('transaction.transactionDate >= :startDate', { startDate })
      .andWhere('transaction.transactionDate < :endDate', { endDate })
      .setParameters({
        incomeType: TransactionType.INCOME,
        expenseType: TransactionType.EXPENSE,
      })
      .getRawOne<{
        totalIncome: string | null;
        totalExpense: string | null;
      }>();

    const totalIncome = Number(result?.totalIncome ?? 0);
    const totalExpense = Number(result?.totalExpense ?? 0);

    return {
      year,
      month,
      totalIncome: String(totalIncome),
      totalExpense: String(totalExpense),
      balance: String(totalIncome - totalExpense),
    };
  }

  async getExpensesByCategory(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<{
    startDate: string;
    endDate: string;
    totalExpense: string;
    categories: {
      categoryId: number;
      categoryName: string;
      totalExpense: string;
      percentage: number;
    }[];
  }> {
    if (startDate > endDate) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    const results = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COALESCE(SUM(transaction.amount), 0)', 'totalExpense')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :expenseType', {
        expenseType: TransactionType.EXPENSE,
      })
      .andWhere('transaction.transactionDate >= :startDate', {
        startDate,
      })
      .andWhere(
        'transaction.transactionDate < DATE_ADD(:endDate, INTERVAL 1 DAY)',
        { endDate },
      )
      .groupBy('category.id')
      .addGroupBy('category.name')
      .orderBy('SUM(transaction.amount)', 'DESC')
      .getRawMany<{
        categoryId: number | string;
        categoryName: string;
        totalExpense: string;
      }>();

    const totalExpense = results.reduce(
      (sum, category) => sum + Number(category.totalExpense),
      0,
    );

    const categories = results.map((category) => {
      const categoryExpense = Number(category.totalExpense);

      return {
        categoryId: Number(category.categoryId),
        categoryName: category.categoryName,
        totalExpense: String(categoryExpense),
        percentage:
          totalExpense === 0
            ? 0
            : Number(((categoryExpense / totalExpense) * 100).toFixed(2)),
      };
    });

    return {
      startDate,
      endDate,
      totalExpense: String(totalExpense),
      categories,
    };
  }
}
