import { IsDefined, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryCoinHistoryDto {
  @ApiProperty({ description: 'date of data snapshot (DD-MM-YYYY)', example: '30-05-2026' })
  @IsDefined()
  @IsString()
  date: string;

  @ApiProperty({ required: false, description: 'include all localized languages, default: true' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  localization?: boolean;
}
