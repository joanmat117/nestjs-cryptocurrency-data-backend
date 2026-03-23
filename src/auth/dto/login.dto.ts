import { IsDefined, IsLowercase, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Secret phrase for authentication (space-separated words)',
    example: 'correct horse battery staple',
    minLength: 3,
  })
  @IsDefined()
  @IsString()
  @IsLowercase()
  secretPhrase: string;
}
