import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),
	],
	controllers: [GameController],
	providers: [GameService],
})
export class GameModule {}
