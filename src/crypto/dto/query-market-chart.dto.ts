import { IsDefined, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryMarketChartDto {
  @ApiProperty({ description: 'target currency of market data', example: 'usd' })
  @IsDefined()
  @IsString()
  vs_currency: string;

  @ApiProperty({ description: 'data up to number of days ago (use "max" for maximum)', example: '1' })
  @IsDefined()
  @IsString()
  days: string;

  @ApiProperty({ required: false, description: 'data interval, leave empty for auto granularity', enum: ['5m', 'hourly', 'daily'] })
  @IsOptional()
  @IsString()
  interval?: string;

  @ApiProperty({ required: false, description: 'decimal place for currency price value' })
  @IsOptional()
  @IsString()
  precision?: string;
}
