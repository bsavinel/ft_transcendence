import {
	Injectable,
	CanActivate,
	ExecutionContext,
	Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import {roleChannel} from '@prisma/client';
import { Socket } from 'socket.io';
import {PrismaService} from 'src/prisma.service';
import { instanceOfToken } from 'src/type/token.type';

/*
 * Check for each socket event received, before it is even
 * processed, if the client has a valid token.
 * If token valid:
 * 		set client.data.accessToken
 * Else throws a WsException (which should be catch and
 * handled by SocketExceptionFilter and EMIT (and not throws)
 * an exception back to the client)
 */

@Injectable()
export class SocketGuard implements CanActivate {
	constructor(private readonly jwt: JwtService) {}
	private logger: Logger = new Logger('SocketGuard');

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client: Socket = context.switchToWs().getClient();
		try {
			const stringToken = this.getToken(client);
			var unpackToken = await this.jwt.verify(stringToken);
		} catch (error) {
			this.logger.error(error.message);
			throw new WsException('Token check failed: ' + error.message);
		}

		if (!instanceOfToken(unpackToken) || unpackToken.type != 'access')
			throw new WsException('Bad token send');
		if (unpackToken.expireAt >= new Date())
			throw new WsException('Token expire');
		client.data.accessToken = unpackToken;
		return true;
	}

	// Check que le client connecte ait bien un header 'auth' (accessible
	// via le handshake), et qu'il ait un attribut 'accessToken'.
	protected getToken(client: Socket): string {
		const auth = client.handshake.auth;
		if (!auth) {
			throw new Error('Missing auth header to socket handshake.');
		}
		if (!auth.accessToken) {
			throw new Error('Missing accessToken to socket handshake.');
		}
		return auth.accessToken;
	}
}

@Injectable()
export class OptTargetGuard implements CanActivate {
	constructor(private prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client: Socket = context.switchToWs().getClient();
		const data: { targetId: string; chanId?: string } = context.switchToWs().getData();

		// get the event name in the handler's @SubscribeMessage decorator
		const opt = Reflect.getMetadata("message", context.getHandler());

		// check if target is itself (nieh)
		if (client.data.accessToken.userId === data.targetId)
			throw new WsException(`Can't ${opt} yourself!`);

		// check if target is creator (forbidden)
		if (!data.chanId) return true;
		const targetRole: roleChannel = (
			await this.prisma.userOnChannel.findUniqueOrThrow({
				where: {
					userId_channelId: {
						userId: +data.targetId,
						channelId: +data.chanId,
					},
				},
			})
		).role;
		if (targetRole === roleChannel.CREATOR)
			throw new WsException(`Can't ${opt} chan Creator!`);
		return true;
	}
}
