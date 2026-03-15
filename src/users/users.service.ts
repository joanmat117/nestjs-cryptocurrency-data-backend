import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { generatePasswordWithOptions } from 'password-generator';
import { User } from './types/user.type';
import config from "./../common/config"
import crypto from "node:crypto"
import argon2 from "argon2"

@Injectable()
export class UsersService {
  private readonly PEPPER:string|undefined
  private readonly VERIFICATION_SECRET: string | undefined

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService
  ){
    this.PEPPER = this.configService.get("SEARCH_HASH_PEPPER")
    this.VERIFICATION_SECRET = this.configService.get("VERIFICATION_HASH_SECRET")
  }

  async create(){

    const secretPhrase = await this.genSecretPhrase()

    const searchHash = this.genSearchHash(secretPhrase)
    const verificationHash = await this.genVerificationHash(secretPhrase)

    const {verification_hash,search_hash,...user} = await this.prismaService.users.create({
      data:{
        search_hash:searchHash,
        verification_hash:verificationHash
      }
    })

    return {
      ...user,
      secret_phrase:secretPhrase
    }
  }

  async findBySecret(secretPhrase:string):Promise<User>{

    if(!this.VERIFICATION_SECRET) throw new InternalServerErrorException()

    const searchHash = this.genSearchHash(secretPhrase)

    const user = await this.prismaService.users.findUnique({
      where:{search_hash:searchHash}
    })

    if(!user) throw new NotFoundException("User does not exists")

    const isValid = await argon2.verify(user.verification_hash,secretPhrase,{
      secret:Buffer.from(this.VERIFICATION_SECRET)
    })

    if(!isValid) throw new UnauthorizedException("Incorrect secret phrase")

    return user
  }

  private async genVerificationHash(phrase:string):Promise<string>{

    if(!this.VERIFICATION_SECRET) throw new InternalServerErrorException()

    const {memoryCost,timeCost,parallelism,hashLength} = config.argon2

    const salt = crypto.randomBytes(16)

    return await argon2.hash(phrase, {
      type: argon2.argon2id,
      secret:Buffer.from(this.VERIFICATION_SECRET),
      memoryCost, 
      salt,
      timeCost,
      parallelism,
      hashLength
    })

  }

  private genSearchHash(phrase:string) {

    if(!this.PEPPER) throw new InternalServerErrorException()

    const hmac = crypto.createHmac('sha256', this.PEPPER);
    hmac.update(phrase);
    return hmac.digest('hex');
  }

  private async genSecretPhrase():Promise<string>{
    return await generatePasswordWithOptions({
      memorable:config.secretPhrase.memorable,
      words:config.secretPhrase.words
    })
  }
}
