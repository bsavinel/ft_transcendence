import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { PrismaModule } from '../prisma.module';
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [PrismaModule, 
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),],
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}
