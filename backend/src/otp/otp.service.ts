import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OtpService {
	constructor(private prisma: PrismaService) {}
	async generate(userId: number) {
		const generateSecret = authenticator.generateSecret();
		const secret = this.prisma.user.update({
			where: { id: userId },
			data: { secretOtp: generateSecret },
		});
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

	async verify(token: string, userId: number) {
		const response = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				secretOtp: true,
			},
		});
		const isValid = authenticator.check(token, response.secretOtp);
		return isValid;
	}

	async activate(token: string, userId: number) {
		const isValid = await this.verify(token, userId);
		if (isValid === true) {
			const response = await this.prisma.user.update({
				where: { id: userId },
				data: { activeOtp: true },
			});
			return response.activeOtp;
		}
		return false;
	}

	async deactivate(token: string, userId: number) {
		const isValid = await this.verify(token, userId);
		if (isValid === true) {
			const response = await this.prisma.user.update({
				where: { id: userId },
				data: { activeOtp: false },
			});
			if (response.activeOtp === false) return true;
		}
		return false;
	}

	async getSecret(userId: number) {
		const secret = await this.prisma.user.findUniqueOrThrow({
			where: { id: userId },
			select: {
				secretOtp: true,
			},
		});
		return secret;
	}

	async isActive(userId: number) {
		const response = await this.prisma.user.findFirstOrThrow({
			where: { id: userId },
			select: {
				activeOtp: true,
			},
		});
		return response.activeOtp;
	}
}
