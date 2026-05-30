import { IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryCoinTickersDto {
  @ApiProperty({ required: false, description: 'exchange ID to filter tickers', example: 'binance' })
  @IsOptional()
  @IsString()
  exchange_ids?: string;

  @ApiProperty({ required: false, description: 'include exchange logo, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_exchange_logo?: boolean;

  @ApiProperty({ required: false, description: 'page through results' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, description: 'sort order', enum: ['trust_score_desc', 'trust_score_asc', 'volume_desc', 'volume_asc'] })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiProperty({ required: false, description: 'include 2% orderbook depth, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  depth?: boolean;
}
