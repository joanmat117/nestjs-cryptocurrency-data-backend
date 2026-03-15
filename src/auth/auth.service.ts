import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import config from "../common/config"
import crypto from "node:crypto"

@Injectable()
export class AuthService {

  private readonly ACCESS_TOKEN_SECRET:string|undefined
  private readonly REFRESH_TOKEN_SECRET:string|undefined
  private readonly ACCESS_TOKEN_EXPIRES_IN:number
  private readonly REFRESH_TOKEN_EXPIRES_IN:number

  constructor(
    private readonly usersService:UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ){
    this.ACCESS_TOKEN_SECRET = this.configService.get("ACCESS_TOKEN_SECRET")
    this.REFRESH_TOKEN_SECRET = this.configService.get("REFRESH_TOKEN_SECRET")
    this.ACCESS_TOKEN_EXPIRES_IN = config.jwt.accessToken.expiresIn
    this.REFRESH_TOKEN_EXPIRES_IN = config.jwt.refreshToken.expiresIn
  }

  async register(){
    return await this.usersService.create()
  }

  async login(loginDto:LoginDto){

    if(!this.ACCESS_TOKEN_SECRET) throw new InternalServerErrorException()

    const {id:userId} = await this.usersService.findBySecret(loginDto.secretPhrase)
    const familyId = crypto.randomUUID()


    const accessToken = await this.genAccessToken({sub:userId}) 
    const refreshToken = await this.genRefreshToken({sub:userId,familyId})

    this.saveRefreshToken({
      familyId,
      userId,
      token:refreshToken
    })

    return {
      accessToken,
      refreshToken
    }
  }

  private async genAccessToken({
    sub
  }:{
    sub:string
  }):Promise<string>{
    return await this.jwtService.signAsync({
      sub
    },
    {
      expiresIn:this.ACCESS_TOKEN_EXPIRES_IN,
      secret:this.ACCESS_TOKEN_SECRET
    })
  }

  private async genRefreshToken({
    familyId,
    sub
  }:{
    sub:string,
    familyId:string
  }):Promise<string>{
    return await this.jwtService.signAsync({
      sub,
      familyId,
      version:1
    },
    {
      expiresIn:this.REFRESH_TOKEN_EXPIRES_IN,
      secret:this.REFRESH_TOKEN_SECRET
    })
  }

  private async saveRefreshToken({
    token,
    userId,
    familyId
  }:{
    token:string,
    userId:string,
    familyId:string
  }){

    const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

    const expirationDate = new Date(Date.now() + (this.REFRESH_TOKEN_EXPIRES_IN * 1000))

    const refreshTokenEntity = await this.prismaService.refresh_tokens.create({
      data:{
        token:tokenHash,
        user_id:userId,
        family_id:familyId,
        expires_at:expirationDate
      }
    }) 

    if(!refreshTokenEntity)  throw new InternalServerErrorException()
  }
}
