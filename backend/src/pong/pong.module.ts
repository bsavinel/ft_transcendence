import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';
import { GameService } from 'src/game/game.service';
import { InvitationsService } from '../invitations/invitations.service';
import {UsersService} from 'src/users/users.service';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),
	],
	providers: [PongGateway, UsersService, GameService, InvitationsService,],
})
export class PongModule {}
