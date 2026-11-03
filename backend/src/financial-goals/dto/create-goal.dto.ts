import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({
    example: 'Buy a Laptop',
    description: 'Title of the financial goal',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    example: 100000000,
    description: 'Target amount of the financial goal',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  targetAmount!: number;

  @ApiProperty({
    example: '2027-06-01',
    description: 'Deadline for achieving the goal',
  })
  @IsDateString()
  deadline!: string;

  @ApiPropertyOptional({
    example: 'Saving money for a new laptop',
    description: 'Optional description of the goal',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
