import { Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ParseSecretPhrasePipe } from 'src/common/pipes/parse-secret-phrase.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(){
    const newUser = await this.authService.register()

    return {
      message: "Registered successfully",
      data:{
        secretPhrase:newUser.secret_phrase
      }
    }
  }

  @Post("login")
  async login(
    @Body() loginDto:LoginDto, 
    @Body('secretPhrase',new ParseSecretPhrasePipe()) secretPhrase:string
  ){
    loginDto.secretPhrase = secretPhrase

    return await this.authService.login(loginDto)
  }
}
