import { IsDefined, IsLowercase, IsString } from "class-validator";

export class LoginDto {
  @IsDefined()
  @IsString()
  @IsLowercase()
  secretPhrase:string
}
