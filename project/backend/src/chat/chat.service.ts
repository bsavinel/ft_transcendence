import { Injectable } from '@nestjs/common';
import { Channel } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getAllChannels(): Promise<Channel[]> {
    return this.prisma.channel.findMany();
  }
}
