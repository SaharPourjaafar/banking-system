import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    example: 5000000,
    description: 'Maximum budget amount',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiProperty({
    example: '2026-10-01',
    description: 'Budget start date',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-10-31',
    description: 'Budget end date',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    example: 1,
    description: 'ID of an existing expense category',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoryId!: number;
}
