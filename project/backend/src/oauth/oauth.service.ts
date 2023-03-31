import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class OauthService {
	constructor(private prisma: PrismaService) {}

	async signUp(login: string, password: string): Promise<User[]> {
		return this.prisma.user.findMany();
	}

	async signIn(login: string, password: string): Promise<User[]> {
		return this.prisma.user.findMany();
	}
}
