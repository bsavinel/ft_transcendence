import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AccessGuard } from 'src/guards/access.guard';
import { RequestWithAccess } from 'src/type/token.type';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
	constructor(private otpService: OtpService) {}

	@Post('generate')
	generate(@Body() param: { userId: number }) {
		return this.otpService.generate(param.userId);
	}

	@UseGuards(AccessGuard)
	@Get('secret')
	getSecret(@Req() request: RequestWithAccess) {
		return this.otpService.getSecret(request.accessToken.userId);
	}

	@Get('check')
	check() {
		return this.otpService.check();
	}

	@UseGuards(AccessGuard)
	@Post('activate')
	activate(
		@Req() request: RequestWithAccess,
		@Body() Data: { token: string }
	): Promise<boolean> {
		return this.otpService.activate(Data.token, request.accessToken.userId);
	}

	@UseGuards(AccessGuard)
	@Post('deactivate')
	deactivate(
		@Req() request: RequestWithAccess,
		@Body() Data: { token: string }
	): Promise<boolean> {
		return this.otpService.deactivate(
			Data.token,
			request.accessToken.userId
		);
	}

	@Post('verify')
	verify(@Body() param: { token: string; userId: number }): Promise<boolean> {
		return this.otpService.verify(param.token, param.userId);
	}

	@Get('isActive')
	isActive(@Query('userId') userId: string): Promise<boolean> {
		return this.otpService.isActive(+userId);
	}
}
