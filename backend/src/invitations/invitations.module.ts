import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { PrismaModule } from 'src/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),
	],
	controllers: [InvitationsController],
	providers: [InvitationsService],
})
export class InvitationsModule {}
