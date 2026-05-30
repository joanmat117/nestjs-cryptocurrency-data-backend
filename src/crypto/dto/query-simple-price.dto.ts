import { IsDefined, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QuerySimplePriceDto {
  @ApiProperty({
    description: 'coin IDs, comma-separated if querying more than 1 coin',
    example: 'bitcoin,ethereum',
  })
  @IsDefined()
  @IsString()
  ids: string;

  @ApiProperty({
    description: 'target currency of coins, comma-separated if querying more than 1 currency',
    example: 'usd,eur',
  })
  @IsDefined()
  @IsString()
  vs_currencies: string;

  @ApiProperty({ required: false, description: 'include market capitalization, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_market_cap?: boolean;

  @ApiProperty({ required: false, description: 'include 24hr volume, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_24hr_vol?: boolean;

  @ApiProperty({ required: false, description: 'include 24hr change percentage, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_24hr_change?: boolean;

  @ApiProperty({ required: false, description: 'include last updated price time in UNIX, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_last_updated_at?: boolean;

  @ApiProperty({ required: false, description: 'decimal place for currency price value' })
  @IsOptional()
  @IsString()
  precision?: string;
}
