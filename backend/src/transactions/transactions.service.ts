import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    userId: number,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const category = await this.categoriesService.findOneByUser(
      dto.categoryId,
      userId,
    );

    if (String(category.type) !== String(dto.type)) {
      throw new BadRequestException(
        'Transaction type must match category type',
      );
    }

    const transaction = this.transactionsRepository.create({
      amount: String(dto.amount),
      type: dto.type,
      description: dto.description ?? null,
      transactionDate: new Date(dto.transactionDate),
      userId,
      categoryId: category.id,
    });

    return this.transactionsRepository.save(transaction);
  }

  async findAllByUser(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { userId },
      relations: { category: true },
      order: { transactionDate: 'DESC' },
    });
  }

  async findOneByUser(id: number, userId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
      relations: { category: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
