import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ParseSecretPhrasePipe } from '../common/pipes/parse-secret-phrase.pipe';
import { type Response, type Request } from 'express';
import { JwtManagerService } from './jwt-manager.service';
import { AuthGuard } from './guards/auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtManager: JwtManagerService,
  ) { }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
    description:
      'Creates a new user with a generated secret phrase. Rate limited to 3 requests per minute.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'Register successful',
        data: {
          secretPhrase: 'correct horse battery staple',
        },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async register(): Promise<any> {
    const newUser = await this.authService.register();

    return {
      message: 'Register successful',
      data: {
        secretPhrase: newUser.secret_phrase,
      },
    };
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates user with secret phrase. Sets access and refresh tokens in cookies. Rate limited to 3 requests per minute.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Login credentials with secret phrase',
    examples: {
      example1: {
        value: {
          secretPhrase: 'correct horse battery staple',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - tokens set in cookies',
    schema: {
      example: {
        message: 'Login successful',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid secret phrase format',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Body('secretPhrase', new ParseSecretPhrasePipe()) secretPhrase: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    loginDto.secretPhrase = secretPhrase;

    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    this.jwtManager.setTokensInCookies(res, accessToken, refreshToken);

    return {
      message: 'Login successful',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User logout',
    description:
      'Logs out user by invalidating refresh token and clearing cookies. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logout successful',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid token required',
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const { refreshToken } = this.jwtManager.getTokensFromCookies(req);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.jwtManager.clearTokensFromCookies(res);

    return {
      message: 'Logout successful',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refreshes JWT tokens using the refresh token from cookies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully - new tokens set in cookies',
    schema: {
      example: {
        message: 'Tokens refreshed successfully',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token not found or invalid',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const { refreshToken } = this.jwtManager.getTokensFromCookies(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(refreshToken);

    this.jwtManager.setTokensInCookies(res, accessToken, newRefreshToken);

    return {
      message: 'Tokens refreshed successfully',
      //accessToken,
      //refreshToken: newRefreshToken,
    };
  }
}
