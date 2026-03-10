import { BadRequestException, PipeTransform } from "@nestjs/common";
import config from "./../config"


export class ParseSecretPhrasePipe implements PipeTransform<string,string> {
  transform(value: string) {

    if(typeof value !== 'string'){
      throw new BadRequestException("secretPhrase must be string")
    }

    if(value.trim().split(" ").length !== config.secretPhrase.words){
      throw new BadRequestException("invalid secret phrase structure")
    }

    return value

  }
}
