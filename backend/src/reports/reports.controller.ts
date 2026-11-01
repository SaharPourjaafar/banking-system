import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { ReportsService } from './reports.service';
import { ReportSummaryQueryDto } from './dto/report-summary-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MonthlyReportQueryDto } from './dto/monthly-report-query.dto';

interface AuthenticatedRequest extends Request {
  user: { id: number; email: string };
}

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiQuery({ name: 'startDate', example: '2026-10-01' })
  @ApiQuery({ name: 'endDate', example: '2026-10-31' })
  getSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: ReportSummaryQueryDto,
  ) {
    return this.reportsService.getSummary(
      req.user.id,
      query.startDate,
      query.endDate,
    );
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly financial report' })
  @ApiQuery({ name: 'year', example: 2026 })
  @ApiQuery({ name: 'month', example: 10 })
  getMonthlyReport(
    @Req() req: AuthenticatedRequest,
    @Query() query: MonthlyReportQueryDto,
  ) {
    return this.reportsService.getMonthlyReport(
      req.user.id,
      query.year,
      query.month,
    );
  }
}
