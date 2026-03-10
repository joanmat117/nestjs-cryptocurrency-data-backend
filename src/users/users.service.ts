import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from "bcrypt"
import { ConfigService } from '@nestjs/config';
import { generatePasswordWithOptions } from 'password-generator';
import { User } from './types/user.type';
import config from "./../common/config"

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService
  ){}

  async create():Promise<User> {

    const secretPhrase = await this.genSecretPhrase()
    const hashedSecretPhrase = await this.hashPassword(secretPhrase)

    const {secret_phrase,...user} = await this.prismaService.users.create({
      data:{
        secret_phrase:hashedSecretPhrase
      }
    })

    return {
      ...user,
      secret_phrase:secretPhrase
    }
  }

  async findBySecret(secretPhrase:string){
  //TODO: Buscar una forma de obtener el phrase hash para compararlo con la phrase con bcrypt.compare
  }

  private async hashPassword(password:string){
    const SALT_ROUNDS = +this.configService.get("SALT_ROUNDS")
    return await bcrypt.hash(password,SALT_ROUNDS)
  }

  private async genSecretPhrase():Promise<string>{
    return await generatePasswordWithOptions({
      memorable:config.secretPhrase.memorable,
      words:config.secretPhrase.words
    })
  }
}
