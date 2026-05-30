import { IsDefined, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryMarketChartRangeDto {
  @ApiProperty({ description: 'target currency of market data', example: 'usd' })
  @IsDefined()
  @IsString()
  vs_currency: string;

  @ApiProperty({ description: 'starting date in ISO date or UNIX timestamp', example: '2024-01-01' })
  @IsDefined()
  @IsString()
  from: string;

  @ApiProperty({ description: 'ending date in ISO date or UNIX timestamp', example: '2024-12-31' })
  @IsDefined()
  @IsString()
  to: string;

  @ApiProperty({ required: false, description: 'data interval, leave empty for auto granularity', enum: ['5m', 'hourly', 'daily'] })
  @IsOptional()
  @IsString()
  interval?: string;

  @ApiProperty({ required: false, description: 'decimal place for currency price value' })
  @IsOptional()
  @IsString()
  precision?: string;
}
