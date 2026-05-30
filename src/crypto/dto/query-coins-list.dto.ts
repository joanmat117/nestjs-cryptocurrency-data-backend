import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryCoinsListDto {
  @ApiProperty({ required: false, description: 'include platform and token contract addresses, default: false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_platform?: boolean;

  @ApiProperty({ required: false, description: 'filter by status of coins, default: active', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  status?: string;
}
