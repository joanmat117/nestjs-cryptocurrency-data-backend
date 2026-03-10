import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import config from "./../common/config"

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[
    UsersModule,
    JwtModule.register({
      global:true,
      secret:config.jwt.accessTokenSecret,
      signOptions: {
        expiresIn: "15m"
      }
    })
  ]
})
export class AuthModule {}
