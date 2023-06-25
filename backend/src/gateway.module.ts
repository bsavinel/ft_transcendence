import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChannelsService } from './channels/channels.service';
import { AppGateway } from './gateway';
import { InvitationsService } from './invitations/invitations.service';
import { MessagesService } from './messages/messages.service';
import { PrismaModule } from './prisma.module';
import { UsersService } from './users/users.service';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),
	],
	providers: [
		AppGateway,
		MessagesService,
		ChannelsService,
		UsersService,
		InvitationsService,
	],
})
export class GatewayModule {}
