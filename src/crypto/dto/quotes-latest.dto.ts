import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuotesLatestDto {
  @ApiProperty({
    description: 'Cryptocurrency symbol (e.g., BTC, ETH)',
    example: 'BTC',
    required: false,
  })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiProperty({
    description: 'Cryptocurrency ID',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Cryptocurrency slug',
    example: 'bitcoin',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Currency to convert to (e.g., USD, EUR)',
    example: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  convert?: string;
}
