import { IsOptional, IsString } from 'class-validator';

export class QuotesLatestDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  convert?: string;
}
