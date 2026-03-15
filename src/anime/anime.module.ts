import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';

@Module({
  controllers: [AnimeController],
  providers: [AnimeService],
})
export class AnimeModule {}
