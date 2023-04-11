import { Body, Controller, Get, Post } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Get('generate')
  generate() {
    return this.otpService.generate();
  }

  @Get('check')
  check() {
    return this.otpService.check();
  }

  @Post('activate')
  activate(@Body() Data: { token: string }): Promise<boolean> {
    return this.otpService.activate(Data.token);
  }

  @Post('deactivate')
  deactivate(@Body() Data: { token: string }): Promise<boolean> {
    return this.otpService.deactivate(Data.token);
  }

  @Post('verify')
  verify(@Body() Data: { token: string }): Promise<boolean> {
    return this.otpService.verify(Data.token);
  }
}
