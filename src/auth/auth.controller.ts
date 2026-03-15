import { Body, Controller, HttpCode, HttpStatus, Post, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ParseSecretPhrasePipe } from 'src/common/pipes/parse-secret-phrase.pipe';
import { type Response } from 'express';
import config from "./../common/config"

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(){
    const newUser = await this.authService.register()

    return {
      message: "Register successful",
      data:{
        secretPhrase:newUser.secret_phrase
      }
    }
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto:LoginDto, 
    @Body('secretPhrase',new ParseSecretPhrasePipe()) secretPhrase:string,
    //@Res({passthrough:true}) res:Response
  ){
    loginDto.secretPhrase = secretPhrase

    const {accessToken,refreshToken} = await this.authService.login(loginDto)

    /*
    res.cookie(config.jwt.accessToken.cookieName,accessToken,{
      secure:true,
      httpOnly:true,
      maxAge:config.jwt.accessToken.expiresIn * 1000,
      sameSite:"strict",
      path:"/"
    })

      res.cookie(config.jwt.refreshToken.cookieName,refreshToken,{
      secure:true,
      httpOnly:true,
      maxAge:config.jwt.refreshToken.expiresIn * 1000,
      sameSite:"strict",
      path:"/"
    })
    */

    return {
      message:"Login successful",
      accessToken,
      refreshToken
    }

  }
}
