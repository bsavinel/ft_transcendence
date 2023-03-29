import { Controller, Get } from '@nestjs/common';
import { Channel } from '@prisma/client';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  getAllChannels(): Promise<Channel[]> {
    return this.chatService.getAllChannels();
  }
}
