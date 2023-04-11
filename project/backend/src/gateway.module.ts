import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './gateway';
import { MessagesService } from './messages/messages.service';
import { PrismaModule } from './prisma.module';

@Module({
	imports: [PrismaModule, 
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),],
	providers: [AppGateway, MessagesService],
})
export class GatewayModule {}
