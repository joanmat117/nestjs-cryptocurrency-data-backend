import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {z} from "zod"
import { registerEnvConfig } from './common/config/env';
import { AnimeModule } from './anime/anime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load:[registerEnvConfig],
      validatePredefined:true
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AnimeModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
