import { IsOptional, IsString } from 'class-validator';

export class CryptocurrencyInfoDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
