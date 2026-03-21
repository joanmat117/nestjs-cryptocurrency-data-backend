import { Module } from '@nestjs/common';
import { RandomService } from './random.service';
import { RandomController } from './random.controller';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [RandomController],
  providers: [RandomService,AuthGuard],
  imports:[AuthModule]
})
export class RandomModule {}
