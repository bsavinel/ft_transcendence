import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roleChannel } from '@prisma/client';
import { PrismaService } from '../prisma.service';
/*
 * Autorise ou non une request en fonction du roleChannel.
 * Fonctionnement: returns true if this user's (the one who
 * made the request) role in the requested channel is parmis
 * les roles autorises a acceder a la request, cad les roles
 * renseignes dans le @Roles au dessus d'un methode.
 * Attention: le parametre de du controleur doit s'appeler
 * 'chanId'.
 */

@Injectable()
export class ChanRoleGuard implements CanActivate {
	constructor(private reflector: Reflector, private prisma: PrismaService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const roles = this.reflector.get<roleChannel[]>(
			'roles',
			context.getHandler()
		);
		if (!roles) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const chanId: number = +request.params?.chanId;
		// TODO: a remplacer par le vrai
		// const user = request.accessToken.userId;
		const userId = 1;
		const role: roleChannel = (
			await this.prisma.userOnChannel.findUnique({
				where: {
					userId_channelId: {
						userId: userId,
						channelId: chanId,
					},
				},
			})
		)?.role;
		return role === undefined || roles.includes(role);
	}
}
