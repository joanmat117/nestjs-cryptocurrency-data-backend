import { Controller, Get, UseGuards } from '@nestjs/common';
import { RandomService } from './random.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('random')
export class RandomController {
  constructor(private readonly randomService: RandomService) {}

  @Get('quote')
  async quote(){
    return await this.randomService.quote()
  }   

}
