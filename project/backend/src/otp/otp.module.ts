import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
	imports: [
		PrismaModule,
		JwtModule.register({ secret: process.env.TOKEN_SECRET }),
	],
	controllers: [OtpController],
	providers: [OtpService],
})
export class OtpModule {}
