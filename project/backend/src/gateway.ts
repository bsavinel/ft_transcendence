import {
	ClassSerializerInterceptor,
	Logger,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import {
	MessageBody,
	OnGatewayInit,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayDisconnect,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from './channels/channels.service';
import { AccessGuard } from './guards/access.guard';
import { CreateMessageDto } from './messages/dto/create-message.dto';
import { MessagesService } from './messages/messages.service';

/*
 * We can consumme or emit event on the gateway server.
 * You have a websocket server that can receive events from the client
 * that is consumming the websocket server. The chat (the ui) is the
 * client that is going to consumme the websocket server, and  the chat
 * needs to send events to the websocket gateway, using the websocket
 * protocol.
 * Our web socket gateway is a socket io server.
 */

/*
 * VIP Datas:
 * -  namespace: to set in the url, pour 'decouper' les ws.
 * -  SubscribeMessage param: to set in the client (front)
 *    'acknoledgement' opt.
 */

@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(AccessGuard)
@WebSocketGateway({
	namespace: 'chatns',
	cors: { origin: '*' },
})
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly messagesService: MessagesService,
		private readonly channelsService: ChannelsService
	) {}
	// Attaches the web socket server to the attribute 'server';
	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('AppGateway');
	private socketMap: Map<string, Socket> = new Map<string, Socket>();

	afterInit() {
		this.logger.log('Init done');
	}

	handleConnection(client: Socket) {
		this.logger.log('Connected: ' + client.id);
	}

	handleDisconnect(client: Socket) {
		this.logger.log('Disconnected: ' + client.id);
	}

	// this means we can send events to the server under the 'newMsg'
	// event name.
	@SubscribeMessage('newMsg')
	async onNewMessage(
		@MessageBody() msgbody: CreateMessageDto
	): Promise<CreateMessageDto> {
		this.logger.log(msgbody);
		this.messagesService.create(msgbody);
		this.server.emit('afterNewMessage', msgbody);
		return msgbody;
	}

	@SubscribeMessage('createRoom')
	createRoom(
		@MessageBody() data: { user: string; chanId: string },
		@ConnectedSocket() client: Socket
	) {
		('createRoom');
		this.logger.debug('createRoom');
		client.join(data.chanId);
		this.socketMap.set(data.chanId, client);
		// console.log(this.socketMap.get(data).rooms);
		// client.rooms.forEach(function(value, key) {
		// console.log(key + ' = ' + value)
		// })
		// this.sendToRoom();
		this.server.to(data.chanId).emit('afterNewMessage', {
			creatorId: 'Papou',
			content: 'Coucou',
			channelId: data.chanId,
		});
	}

	@SubscribeMessage('joinRoom')
	joinRoom(
		@MessageBody() data: { user: string; chanId: string },
		@ConnectedSocket() client: Socket
	) {
		this.logger.debug('>>>> Gateway: joinRoom');
		this.logger.debug('>>>> data:', data);
		client.join(data.chanId);
		this.channelsService.joinChan(+data.user, +data.chanId);
		//this.sendMessageToRoom
	}

	@SubscribeMessage('joinProtectedRoom')
	joinProtectedRoom(
		@MessageBody() data: { user: string; chanId: string; pwd: string },
		@ConnectedSocket() client: Socket
	) {
		try {
			if (data.pwd !== 'test') {
				throw new Error('badPassword');
			}
			//TODO
			//check pwd
			this.joinRoom(data, client);
			this.server.emit('validPassword');
		} catch (err) {
			this.logger.error(err);
			this.server.emit('badPassword');
			//TODO
			//send error
		}
	}

	@SubscribeMessage('joinMultipleRoom')
	joinMultipleRoom(
		@MessageBody() data: Array<string>,
		@ConnectedSocket() client: Socket
	) {
		client.join(data);
		data.map((room) => {
			this.socketMap.set(room, client);
		});
		// this.sendToRoom();
	}

	sendToRoom(data: { user: string; msg: string; chanId: string }) {
		this.server.to(data.chanId).emit('afterNewMessage', {
			user: data.user,
			message: data.msg,
		});
	}

	// sendToRoom() {
	// console.log('sendToRoom');
	// this.server.to('1').emit('afterNewMessage', { user: 'server', message: 'Message to 1' });
	// }
}
