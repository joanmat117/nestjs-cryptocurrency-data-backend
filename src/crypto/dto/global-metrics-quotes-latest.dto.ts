import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GlobalMetricsQuotesLatestDto {
  @ApiProperty({
    description: 'Currency to convert to (e.g., USD, EUR)',
    example: 'USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  convert?: string;
}
