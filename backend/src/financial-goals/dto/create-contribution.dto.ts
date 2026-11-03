import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateContributionDto {
  @ApiProperty({
    example: 10000000,
    description: 'Amount contributed toward the financial goal',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiProperty({
    example: '2026-11-01',
    description: 'Date of the contribution',
  })
  @IsDateString()
  contributionDate!: string;

  @ApiPropertyOptional({
    example: 'Savings from monthly salary',
    description: 'Optional note about the contribution',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
