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

import { FinancialGoalsService } from './financial-goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';

import { FinancialGoal } from './entities/financial-goal.entity';
import { GoalContribution } from './entities/goal-contribution.entity';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: number; email: string };
}

@ApiTags('Financial Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial-goals')
export class FinancialGoalsController {
  constructor(private readonly financialGoalsService: FinancialGoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a financial goal' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateGoalDto,
  ): Promise<FinancialGoal> {
    return this.financialGoalsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user financial goals' })
  findAll(@Req() req: AuthenticatedRequest): Promise<FinancialGoal[]> {
    return this.financialGoalsService.findAllByUser(req.user.id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get financial goal progress summary' })
  @ApiParam({ name: 'id', type: Number })
  getSummary(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.financialGoalsService.getSummary(id, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a financial goal by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FinancialGoal> {
    return this.financialGoalsService.findOneByUser(id, req.user.id);
  }

  @Post(':id/contributions')
  @ApiOperation({ summary: 'Add a contribution to a financial goal' })
  @ApiParam({ name: 'id', type: Number })
  addContribution(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContributionDto,
  ): Promise<GoalContribution> {
    return this.financialGoalsService.addContribution(id, req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a financial goal' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGoalDto,
  ): Promise<FinancialGoal> {
    return this.financialGoalsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a financial goal' })
  @ApiParam({ name: 'id', type: Number })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.financialGoalsService.remove(id, req.user.id);
  }
}
