import { Controller, Get } from '@nestjs/common';
import {generatePasswordWithOptions} from "password-generator"
import config from "./common/config"

@Controller()
export class AppController {
  @Get("health")
  health() {
    return {
      ok:true,
      message:"Everything is alright",
      date:new Date().toUTCString()
    }
  }

  @Get("random-password")
  async genPhrase(){
    
    const phrase = await generatePasswordWithOptions({
      words:config.secretPhrase.words,
      memorable:config.secretPhrase.memorable
    })

    return {
      phrase
    }
  }
}
