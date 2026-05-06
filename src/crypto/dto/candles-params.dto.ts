import { IsOptional, IsString, Max, Min } from "class-validator";

export class CandlesParamsDto {

  @IsString()
  interval: string

  @IsOptional()
  endTime?: number

  @IsOptional()
  startTime?: number

  @IsOptional()
  @Max(1000)
  @Min(1)
  limit?: number
}
