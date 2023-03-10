import { Get, Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post()
  async createUser( @Body() userData: { login: string; password: string}): Promise<User> {
    return this.usersService.createUser(userData);
  }

//   @Post('signup')
//   async signup( @Body() userData: { login: string; password: string}): Promise<User> {
//   }

//   @Post('signin')
//   async signin( @Body() userData: { login: string; password: string}): Promise<User> {
//   }
}
