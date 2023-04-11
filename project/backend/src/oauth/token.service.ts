import { PrismaService } from 'src/prisma.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { addDays, addMinutes } from 'date-fns';
import { Token } from 'src/type/token.type';

@Injectable()
export class TokenService {
	constructor(
		private prisma: PrismaService,
		private readonly jwt: JwtService
	) {}

	// TODO on fait un cookie de session ou on met un champ user
	async generateAccessToken(id: number): Promise<string> {
		let payload: Token = {
			type: 'access',
			code: crypto.randomUUID(),
			expireAt: addMinutes(new Date(), 6),
			userId: id,
		};
		return this.jwt.sign(payload);
	}

	async generateRefreshToken(id: number): Promise<string> {
		let payload: Token = {
			type: 'refresh',
			code: crypto.randomUUID(),
			userId: id,
			expireAt: addDays(new Date(), 6),
		};

		await this.prisma.authentification.create({
			data: {
				expireAt: payload.expireAt,
				code: payload.code,
				userId: payload.userId,
			},
		});
		return this.jwt.sign(payload);
	}

	async deleteRefreshToken(refresh_code: string): Promise<void> {
		await this.prisma.authentification.delete({
			where: { code: refresh_code },
		});
	}

	async ExistRefreshToken(refresh_code: string): Promise<boolean> {
		const ret = await this.prisma.authentification.findUnique({
			where: { code: refresh_code },
		});
		return !!ret;
	}

	async disconectFromEveryWhere(userId: number): Promise<number> {
		let res = await this.prisma.authentification.deleteMany({
			where: { userId },
		});
		return res.count;
	}
}
