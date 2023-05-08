import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import {ValidationError} from 'class-validator';
import { Socket } from 'socket.io';

@Catch(WsException)
export class SocketExceptionFilter extends BaseWsExceptionFilter {
	catch(exception: WsException, host: ArgumentsHost) {
		const ctx = host.switchToWs();
		const client: Socket = ctx.getClient();

		if (exception.getError() instanceof Array<ValidationError>) {
			const error: ValidationError = exception.getError()[0];
			client.emit('error', error);
		} else {
			client.emit('error', exception);
		}
		return;
	}
}

/*
 * Permet de catch les erreur HTTP raised alors que le contexte
 * est Ws.
 */
@Catch(HttpException)
export class HttpExcToWsExc extends BaseWsExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		if (host.getType() !== 'ws')
			throw exception ;

		const trans = new WsException([exception.getResponse(),  host.switchToWs().getData()]);
		super.catch(trans, host);

		return;
	}
}

