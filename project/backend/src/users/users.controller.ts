import { Get, Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    console.log('HHIHIH');
    return this.usersService.findAll();
  }

  @Post()
  createUser(
    @Body() userData: { firstName: string; lastName: string; email: string },
  ): Promise<User> {
    console.log('aakaka');
    return this.usersService.createUser(userData);
  }
}
