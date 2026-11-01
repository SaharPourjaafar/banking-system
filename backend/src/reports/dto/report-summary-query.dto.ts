import { IsDateString, Matches } from 'class-validator';

export class ReportSummaryQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must use YYYY-MM-DD format',
  })
  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: 'startDate must be a valid date' },
  )
  startDate!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must use YYYY-MM-DD format',
  })
  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: 'endDate must be a valid date' },
  )
  endDate!: string;
}
