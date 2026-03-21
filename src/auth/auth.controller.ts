import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Res, 
  Req, 
  UseGuards, 
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ParseSecretPhrasePipe } from 'src/common/pipes/parse-secret-phrase.pipe';
import { type Response, type Request } from 'express';
import { JwtManagerService } from './jwt-manager.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtManager: JwtManagerService
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register() {
    const newUser = await this.authService.register();

    return {
      message: "Register successful",
      data: {
        secretPhrase: newUser.secret_phrase
      }
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Body('secretPhrase', new ParseSecretPhrasePipe()) secretPhrase: string,
    @Res({ passthrough: true }) res: Response
  ) {
    loginDto.secretPhrase = secretPhrase;

    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    this.jwtManager.setTokensInCookies(res, accessToken, refreshToken);

    return {
      message: "Login successful",
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken } = this.jwtManager.getTokensFromCookies(req);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.jwtManager.clearTokensFromCookies(res);

    return {
      message: "Logout successful"
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken } = this.jwtManager.getTokensFromCookies(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { accessToken, refreshToken: newRefreshToken } = 
      await this.authService.refreshTokens(refreshToken);

    this.jwtManager.setTokensInCookies(res, accessToken, newRefreshToken);

    return {
      message: "Tokens refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken
    };
  }

}
