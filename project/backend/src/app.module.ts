import { OauthModule } from './oauth/oauth.module';
import { OauthController } from './oauth/oauth.controller';
import { OauthService } from './oauth/oauth.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { GatewayModule } from './gateway.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';

@Module({
	imports: [OauthModule, PrismaModule, GatewayModule, ChatModule, UsersModule, ChannelsModule, MessagesModule ],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
