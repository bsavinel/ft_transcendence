import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  // Return all properties for one user
  // prisma.io/docs/reference/api-reference/prisma-client-reference#findunique
  // NEED TO THROW AN ERROR? :findUniqueOrThrow
  // prisma.io/docs/reference/api-reference/prisma-client-reference#finduniqueorthrow
  async findUnique(id: number): Promise<User> {
    const userFind = await this.prisma.user.findUnique({ where: { id: id } });
    return userFind;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}