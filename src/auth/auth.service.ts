import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService:UsersService,
    private readonly jwtService: JwtService
  ){}

  async register(){
    return await this.usersService.create()
  }

  async login(loginDto:LoginDto){

    const user = await this.usersService.findBySecret(loginDto.secretPhrase)

    if(!user) 
      throw new NotFoundException()

    return user

  }
}
