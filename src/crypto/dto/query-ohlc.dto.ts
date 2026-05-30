import { IsDefined, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryOhlcDto {
  @ApiProperty({ description: 'target currency of price data', example: 'usd' })
  @IsDefined()
  @IsString()
  vs_currency: string;

  @ApiProperty({ description: 'data up to number of days ago', enum: ['1', '7', '14', '30', '90', '180', '365', 'max'] })
  @IsDefined()
  @IsString()
  days: string;

  @ApiProperty({ required: false, description: 'data interval', enum: ['daily', 'hourly'] })
  @IsOptional()
  @IsString()
  interval?: string;

  @ApiProperty({ required: false, description: 'decimal place for currency price value' })
  @IsOptional()
  @IsString()
  precision?: string;
}
