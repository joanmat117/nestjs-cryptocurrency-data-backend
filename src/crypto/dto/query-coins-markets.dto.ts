import { IsDefined, IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryCoinsMarketsDto {
  @ApiProperty({ description: 'target currency of coins and market data', example: 'usd' })
  @IsDefined()
  @IsString()
  vs_currency: string;

  @ApiProperty({ required: false, description: 'coins IDs, comma-separated if querying more than 1 coin', example: 'bitcoin,ethereum' })
  @IsOptional()
  @IsString()
  ids?: string;

  @ApiProperty({ required: false, description: 'filter based on coins category', example: 'layer-1' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, description: 'sort result by field', enum: ['market_cap_asc', 'market_cap_desc', 'volume_asc', 'volume_desc', 'id_asc', 'id_desc'] })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiProperty({ required: false, description: 'total results per page, default: 100, max: 250' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(250)
  per_page?: number;

  @ApiProperty({ required: false, description: 'page through results, default: 1' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, description: 'include sparkline 7 days data, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  sparkline?: boolean;

  @ApiProperty({ required: false, description: 'include price change percentage timeframe, comma-separated', example: '1h,24h,7d' })
  @IsOptional()
  @IsString()
  price_change_percentage?: string;

  @ApiProperty({ required: false, description: 'decimal place for currency price value' })
  @IsOptional()
  @IsString()
  precision?: string;

  @ApiProperty({ required: false, description: 'include rehypothecated tokens in results, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_rehypothecated?: boolean;
}
