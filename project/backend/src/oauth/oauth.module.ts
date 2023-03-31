import { Module } from '@nestjs/common';
import { PrismaModule } from "src/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { TokenService } from "../oauth/token.service";
import { OauthController } from './oauth.controller';
import { UsersService } from 'src/users/users.service';

@Module({
    imports: [PrismaModule,
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),],
    controllers: [OauthController],
    providers: [TokenService, UsersService],
	// exports: [JwtModule]  //? regarder si sa ne poseras pas de probleme lors de la mise en place du midelware
})
export class OauthModule {}
