import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { Budget } from './entities/budget.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateBudgetDto } from './dto/update-budget.dto';

interface AuthenticatedRequest extends Request {
  user: { id: number; email: string };
}

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateBudgetDto,
  ): Promise<Budget> {
    return await this.budgetsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user budgets' })
  findAll(@Req() req: AuthenticatedRequest): Promise<Budget[]> {
    return this.budgetsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Budget> {
    return this.budgetsService.findOneByUser(id, req.user.id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get budget spending summary' })
  @ApiParam({ name: 'id', type: Number })
  getSummary(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.budgetsService.getSummary(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBudgetDto,
  ): Promise<Budget> {
    return this.budgetsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiParam({ name: 'id', type: Number })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.budgetsService.remove(id, req.user.id);
  }
}
