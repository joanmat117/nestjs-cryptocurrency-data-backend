import { Injectable } from '@nestjs/common';

@Injectable()
export class AnimeService {

  async random(){
    return {
      message:"Random Anime"
    }
  }
}
