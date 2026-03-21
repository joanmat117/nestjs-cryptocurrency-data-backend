import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { registerEnvConfig } from './common/config/env';
import { RandomModule } from './random/random.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load:[registerEnvConfig],
      validatePredefined:true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      renderPath:"/"
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RandomModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
