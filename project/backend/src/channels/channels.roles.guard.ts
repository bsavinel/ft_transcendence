import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {WsException} from '@nestjs/websockets';
import { roleChannel } from '@prisma/client';
import {CreateMessageDto} from 'src/messages/dto/create-message.dto';
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

		let chanId: number;
		let userId: number;
		if (context.getType() === 'ws') {
			const client = context.switchToWs().getClient();
			const msgBody = context.switchToWs().getData();
			// Parce que ce guard est utilise sur des methodes qui recoivent differents
			// types de donnees. Surtout, elles recoibent toutes l'id d'un channel, mais
			// elles le nommne differemment (par exemple joinRoom dans le gateway recoit
			// l'id du channel sous le nom 'chanId', tandis que onNewMessage le recoit
			// sous le nom de 'channelId')
			if ('channelId' in msgBody)
				chanId = msgBody.channelId;
			else
				chanId = msgBody.chanId;
			userId = client.data.accessToken.userId;
		} else {
			//http
			const request = context.switchToHttp().getRequest();
			chanId = +request.params?.chanId;
			userId = request.accessToken.userId;
		}

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

@Injectable()
export class MutedGuard implements CanActivate {
	constructor(private prisma: PrismaService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		let chanId: number;
		let userId: number;
		if (context.getType() === 'ws') {
			const client = context.switchToWs().getClient();
			const msgBody: CreateMessageDto = context.switchToWs().getData();
			chanId = msgBody.channelId;
			userId = client.data.accessToken.userId;
		}
		const muteAt = (
			await this.prisma.userOnChannel.findUniqueOrThrow({
				where: {
					userId_channelId: {
						userId: userId,
						channelId: chanId,
					},
				},
			})
		).mutedAt;

		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		if (!muteAt || muteAt < fiveMinutesAgo) return true;
		throw new WsException('You have been muted.');
	}
}
