import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryCategoriesDto {
  @ApiProperty({ required: false, description: 'sort results by field', enum: ['market_cap_desc', 'market_cap_asc', 'name_desc', 'name_asc', 'market_cap_change_24h_desc', 'market_cap_change_24h_asc'] })
  @IsOptional()
  @IsString()
  order?: string;
}
