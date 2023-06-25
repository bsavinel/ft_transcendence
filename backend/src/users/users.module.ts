import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { GameService } from 'src/game/game.service';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),
	],
	controllers: [UsersController],
	providers: [UsersService, GameService],
})
export class UsersModule {}
