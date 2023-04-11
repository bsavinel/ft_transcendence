import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { response } from 'express';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}
  async generate() {
    const secret = authenticator.generateSecret();
    return secret;
  }

  async testToken(secret: string) {
    const token = authenticator.generate(secret);
    return token;
  }

  async check() {
    const response = await this.prisma.user.findUnique({
      where: { id: 1 },
      select: {
        activeOtp: true,
      },
    });
    return response.activeOtp;
  }

  async verify(token: string) {
    const response = await this.prisma.user.findUnique({
      where: { id: 1 },
      select: {
        secretOtp: true,
      },
    });
    const isValid = authenticator.check(token, response.secretOtp);
    return isValid;
  }

  async activate(token: string) {
    const isValid = await this.verify(token);
    if (isValid === true) {
      const response = await this.prisma.user.update({
        where: { id: 1 },
        data: { activeOtp: true },
      });
      return response.activeOtp;
    }
    return false;
  }

  async deactivate(token: string) {
    const isValid = await this.verify(token);
    if (isValid === true) {
      const response = await this.prisma.user.update({
        where: { id: 1 },
        data: { activeOtp: false },
      });
      if (response.activeOtp === false) return true;
    }
    return false;
  }
}
