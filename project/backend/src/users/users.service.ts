// Every model/schema will have CRUD queries in the generated Prisme Client.
// These operations/queries are then accessible via the Prisma Client instance:
// it has properties added to it, wich are the lowercase of the model name (e.g
// user of the User model)
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
// Prisma Client also generates type definitions that reflect your model structures
// These are part of the generated @prisma/client node module.
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
