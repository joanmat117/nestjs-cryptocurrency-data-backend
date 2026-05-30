import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CryptoController],
  providers: [CryptoService],
  imports: [
    AuthModule,
    HttpModule.register({
      baseURL: 'https://api.coingecko.com/api/v3',
    }),
  ],
})
export class CryptoModule { }
