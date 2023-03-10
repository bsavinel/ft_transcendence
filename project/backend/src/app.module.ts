import { OauthModule } from './oauth/oauth.module';
import { OauthController } from './oauth/oauth.controller';
import { OauthService } from './oauth/oauth.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';

@Module({
	imports: [OauthModule, PrismaModule, OauthModule],
	controllers: [AppController, UsersController, OauthController],
	providers: [AppService, UsersService, OauthService],
})
export class AppModule { }
