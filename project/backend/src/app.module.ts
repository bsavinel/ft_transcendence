import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { OauthModule } from "./oauth/oauth.module";
import { OtpModule } from "./otp/otp.module";
import { PrismaModule } from "./prisma.module";
import { GatewayModule } from "./gateway.module";
import { ChatModule } from "./chat/chat.module";
import { UsersModule } from "./users/users.module";
import { ChannelsModule } from "./channels/channels.module";
import { MessagesModule } from "./messages/messages.module";

@Module({
  imports: [
    OauthModule,
    PrismaModule,
    GatewayModule,
    ChatModule,
    UsersModule,
    ChannelsModule,
    MessagesModule,
    OtpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
