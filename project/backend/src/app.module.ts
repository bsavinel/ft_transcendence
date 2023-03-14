import { OauthModule } from './oauth/oauth.module';
import { OauthController } from './oauth/oauth.controller';
import { OauthService } from './oauth/oauth.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';

@Module({
	imports: [OauthModule, PrismaModule, OauthModule],
	controllers: [AppController, OauthController],
	providers: [AppService, OauthService],
})
export class AppModule { }
