import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';
import { GameService } from 'src/game/game.service';
import { InvitationsService } from '../invitations/invitations.service';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),
	],
	providers: [PongGateway, GameService, InvitationsService,],
})
export class PongModule {}
