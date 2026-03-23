import { IsOptional, IsString } from 'class-validator';

export class GlobalMetricsQuotesLatestDto {
  @IsOptional()
  @IsString()
  convert?: string;
}
