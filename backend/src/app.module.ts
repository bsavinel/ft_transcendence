import { GameModule } from './game/game.module';
import { OauthModule } from './oauth/oauth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { PongModule } from './pong/pong.module';
import { GatewayModule } from './gateway.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { InvitationsModule } from './invitations/invitations.module';
import {OtpModule} from './otp/otp.module';

@Module({
	imports: [
		GameModule,
		OauthModule,
		PrismaModule,
		GatewayModule,
		ChatModule,
		UsersModule,
		ChannelsModule,
		MessagesModule,
		PongModule,
		InvitationsModule,
		OtpModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
