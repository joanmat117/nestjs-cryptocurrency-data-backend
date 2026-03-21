import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuotesArray } from './types/quote.type';

@Injectable()
export class RandomService {

  private readonly baseUrl = "https://api.api-ninjas.com/v2/"
  private readonly API_NINJA_API_KEY:string| undefined

    constructor(
      private readonly configService:ConfigService
  ){
    this.API_NINJA_API_KEY = this.configService.get(("API_NINJA_API_KEY"))
  }

  async quote(){

    if(!this.API_NINJA_API_KEY) throw new InternalServerErrorException()

    try {
      const res = await fetch(this.baseUrl + "randomquotes?categories=success,wisdom",{
        headers:{
          "X-Api-Key":this.API_NINJA_API_KEY
        } 
      }) 

      const randomQuotes:QuotesArray = await res.json()

      return randomQuotes[0]
    } catch(e:any){
      console.log(JSON.stringify(e))
      throw new InternalServerErrorException(e.message)
    }
  }
}
