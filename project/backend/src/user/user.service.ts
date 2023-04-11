import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  SaveAvatar() {
    console.log('>>>>>>>>>> UserService <<<<<<<<<<<');
    console.log('>>>>>>>>>> SaveAvatar  <<<<<<<<<<<');
    return;
  }
}
