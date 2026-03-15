import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get('random')
  async random(){
    return await this.animeService.random()
  }   

}
