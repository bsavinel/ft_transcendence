import {
	ClassSerializerInterceptor,
	Logger,
	ParseIntPipe,
	UseFilters,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
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
	WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from './channels/channels.service';
import { OptTargetGuard, SocketGuard } from './guards/socket.guard';
import { CreateMessageDto } from './messages/dto/create-message.dto';
import { MessagesService } from './messages/messages.service';
import {
	HttpExcToWsExc,
	SocketExceptionFilter,
} from './socket/socket-exception.filter';
import { UsersService } from './users/users.service';
// import { instrument } from '@socket.io/admin-ui';
import { Roles } from './channels/roles.decorator';
import { invitMode, roleChannel, User } from '@prisma/client';
import { ChanRoleGuard, MutedGuard } from './channels/channels.roles.guard';
import { PrismaExceptionFilter } from './prisma-exception/prisma-exception.filter';
import { JwtService } from '@nestjs/jwt';
import { instanceOfToken } from './type/token.type';
import * as bcrypt from 'bcrypt';
import { InvitationsService } from './invitations/invitations.service';
import { CreateInvitationDto } from './invitations/dto/create-invitation.dto';
import { ChannelEntity } from './channels/entities/channel.entity';
import { CreateChannelDto } from './channels/dto/create-channel.dto';
import { UserEntity } from './users/entities/user.entity';

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

// Permet de catch toutes les WsException qui sont faites ici
// et s'occupe tout seul d'emit un event 'exception' au client avec
// le bon message et tout.
@UseFilters(PrismaExceptionFilter, HttpExcToWsExc, SocketExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
// Permet (seulement pour les events, et pas pour les connection handlers)
// de check si le client a un token valide.
@UseGuards(SocketGuard)
	@WebSocketGateway({
	namespace: 'chatns',
	cors: { origin: '*' },
})

// @WebSocketGateway({
// 	namespace: '/chatns',
// 	cors: {
// 		origin: [
// 			'http://localhost:3000',
// 			process.env.VITE_FRONT_URL,
// 			'https://admin.socket.io',
// 			'http://localhost:5000/admin',
// 		],
// 		credentials: true,
// 		methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
// 	},
// })
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly messagesService: MessagesService,
		private readonly channelsService: ChannelsService,
		private readonly usersService: UsersService,
		private readonly jwt: JwtService,
		private readonly invitationsService: InvitationsService
	) {}
	// Attaches the web socket server to the attribute 'server';
	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('AppGateway');
	// Map pour chaque user id (number) tous leurs connected sockets pour pouvoir
	// entre autre sync toutes le fenetres d'un meme user
	private usersSockets: Map<number, Socket[]> = new Map<number, Socket[]>();

	afterInit() {
		this.logger.log('Init done');
		// instrument(this.server, { auth: false, mode: 'development' });
	}

	async handleConnection(client: Socket) {
		let unpackToken: any;
		try {
			const stringToken = this.getToken(client);
			unpackToken = await this.jwt.verify(stringToken);
		} catch (error) {
			this.logger.error(error.message);
			throw new WsException('Token check failed: ' + error.message);
		}

		if (!instanceOfToken(unpackToken) || unpackToken.type != 'access')
			throw new WsException('Bad token send');
		if (unpackToken.expireAt >= new Date())
			throw new WsException('Token expire');
		client.data.accessToken = unpackToken;

		await this.makeClientJoinSusChannels(client);

		// On ajoute le socket au user dans la Map usersSockets
		const sockets =
			this.usersSockets.get(client.data.accessToken.userId) || [];

		// Si pas present dans la map => se co donc annonce user logged in aux autres
		if (sockets.length === 0) {
			client.broadcast.emit('someoneLoggedIn', {
				user: client.data.accessToken.userId,
			});
			await this.emitToFriends(
				client.data.accessToken.userId,
				'friendLoggedIn'
			);
		}

		sockets.push(client);
		this.usersSockets.set(client.data.accessToken.userId, sockets);

		this.logger.log(
			'client id ' +
				client.id +
				' for user ' +
				client.data.accessToken.userId +
				' connected'
		);
		return 'Success';
	}

	async handleDisconnect(client: Socket) {
		this.logger.log('Disconnected: ' + client.id);
		// On enleve le socket de la liste de sockets connectes du user
		const sockets =
			this.usersSockets.get(client.data.accessToken.userId) || [];

		const index = sockets.findIndex((socket) => socket.id === client.id);
		if (index !== -1) {
			sockets.splice(index, 1);

			// Si c'etait le dernier socket du user, il s'est deco
			if (sockets.length === 0) {
				this.usersSockets.delete(client.data.accessToken.userId);
				this.server.emit('someoneDisconnected', {
					user: client.data.accessToken.userId,
				});
				await this.emitToFriends(
					client.data.accessToken.userId,
					'friendDisconnected'
				);
				return;
			}

			this.usersSockets.set(client.data.accessToken.userId, sockets);
		}
	}

	// Utilise pour connaitre le status des users provided sous forme
	// de tableau de userId. Pour chaque userId checke, va emit loggin ou
	// disco. Ceci SEULEMENT au client qui en a fait la request, car ces
	// events (someoneLoggedIn et someoneDisconnected) sont listenned par
	// TOUT le front
	@SubscribeMessage('checkStatus')
	checkStatus(
		@MessageBody() data: Array<number>,
		@ConnectedSocket() client: Socket
	) {
		if (data) {
			data.map((id) => {
				const user: Socket[] = this.usersSockets.get(id) || [];
				if (user) {
					this.server
						.to(client.id)
						.emit('someoneLoggedIn', { user: id });
				} else {
					this.server
						.to(client.id)
						.emit('someoneDisconnected', { user: id });
				}
			});
		}
	}

	// data: array de userIds pour lesquels donner l'info si oui ou non
	// ils sont logged;
	@SubscribeMessage('getStatus')
	onGetStatus(
		@MessageBody() data: Array<number>,
		@ConnectedSocket() client: Socket
	): { userId: number; isLogged: boolean }[] {
		if (data) {
			const res: { userId: number; isLogged: boolean }[] = data.map(
				(userId) => {
					const isLogged = this.usersSockets.has(userId);
					return { userId: userId, isLogged: isLogged };
				}
			);
			return res;
		}
		return [];
	}

	@SubscribeMessage('isDirectChanExist')
	async isDirectChanExist(
		@MessageBody() friendId: number,
		@ConnectedSocket() client: Socket
	) {
		const friendChan = await this.channelsService.getDirectChannel(
			+friendId
		);
		const clientChan = await this.channelsService.getDirectChannel(
			client.data.accessToken.userId
		);
		const commonChan = friendChan.find((objA) =>
			clientChan.some((objB) => objB.id === objA.id)
		);
		if (commonChan) {
			return new ChannelEntity(commonChan);
		} else {
			return false;
		}
	}

	//check si l'utilisateur est en ligne
	//--> si en ligne, send invit
	//--> sinon save invit for next connection
	@SubscribeMessage('newInvit')
	newInvit(
		@MessageBody() data: { invit: CreateInvitationDto[]; user: string }
	) {
		data.invit.map((invit: CreateInvitationDto) => {
			const user: Socket[] = this.usersSockets.get(invit.invitedUsers);
			if (user) {
				user.forEach((user) => {
					this.server.to(user.id).emit('displayInvit', {
						type: invit.type,
						username: data.user,
						channelId: invit.channelId,
						friendId: invit.friendId,
					});
				});
			}
			this.invitationsService.createInvitation(
				invit.type,
				invit.channelId,
				invit.friendId,
				invit.invitedUsers,
				data.user
			);
		});
	}

	@SubscribeMessage('handleChatInvit')
	async handleChatInvit(
		@MessageBody() data: { chanId: number; accept: boolean },
		@ConnectedSocket() client: Socket
	) {
		if (data.accept) {
			this.joinRoom(
				{ user: client.data.accessToken.userId, chanId: data.chanId },
				client
			);
			this.channelsService.joinChan(
				client.data.accessToken.userId,
				data.chanId,
				''
			);
		}
		try {
			const invitation = {
				type: invitMode.CHAT,
				friendId: null,
				channelId: data.chanId,
				invitedUsers: client.data.accessToken.userId,
			};
			this.invitationsService.deleteInvitation(invitation);
			return true;
		} catch (error) {
			return false;
		}
	}

	@SubscribeMessage('handleFriendInvit')
	async handleFriendInvit(
		@MessageBody() data: { friendId: number; accept: boolean },
		@ConnectedSocket() client: Socket
	) {
		if (data.accept) {
			this.usersService.addFriend(
				client.data.accessToken.userId,
				data.friendId
			);
			this.usersService.addFriend(
				data.friendId,
				client.data.accessToken.userId
			);
		}
		try {
			const invitation = {
				type: invitMode.FRIEND,
				friendId: data.friendId,
				channelId: null,
				invitedUsers: client.data.accessToken.userId,
			};
			this.invitationsService.deleteInvitation(invitation);
			return true;
		} catch (error) {
			return false;
		}
	}

	// this means we can send events to the server under the 'newMsg'
	// event name.
	@Roles('CREATOR', 'ADMIN', 'USER')
	@UseGuards(ChanRoleGuard)
	@UseGuards(MutedGuard)
	@SubscribeMessage('newMsg')
	async onNewMessage(
		@MessageBody() msgbody: CreateMessageDto,
		@ConnectedSocket() client: Socket
	): Promise<CreateMessageDto> {
		await this.messagesService.create(msgbody);
		//TODO: remplacer tous les server.emit('afterNewMessage' par un truc qui emit
		//que aux room du message, et que aux mecs qui ont pas block le client.userid)
		const blockedByIdsArray: number[] = (
			await this.usersService.getBlockedBy(client.data.accessToken.userId)
		).map((usr) => usr.id);

		let socketIdsWhoBlocked : string[];
		this.usersSockets.forEach((uSockets, userId) => {
			if (blockedByIdsArray.includes(userId)) {
				const ids: string[] = uSockets.map((socket) => socket.id);
				socketIdsWhoBlocked.push(...ids);
			}
		});

		this.server
			.to(`${msgbody.channelId}`)
			.except(socketIdsWhoBlocked)
			.emit('afterNewMessage', msgbody);

		return msgbody;
	}

	// Send message to a single channel / room
	@SubscribeMessage('sendMessage')
	sendMessageToOneChannel(
		@MessageBody() data: { user: string; msg: string; chanId: string }
	) {
		this.server
			.to(data.chanId)
			.emit('afterNewMessage', { user: data.user, message: data.msg });
	}

	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	@SubscribeMessage('createRoom')
	async createRoom(
		@MessageBody() data: CreateChannelDto,
		@ConnectedSocket() client: Socket
	): Promise<ChannelEntity> {
		const newChan: ChannelEntity = await this.channelsService.create(
			data,
			client.data.accessToken.userId
		);
		const sockets: Socket[] = this.usersSockets.get(
			client.data.accessToken.userId
		);
		sockets.forEach((s) => s.join(`${newChan.id}`));
		const { password, salt, ...chanWithoutPass } = newChan;
		this.server
			.to(`${newChan.id}`)
			.emit('youCreatedAChan', chanWithoutPass);
		return new ChannelEntity(newChan);
	}

	@Roles('CREATOR', 'ADMIN', 'USER', null)
	@UseGuards(ChanRoleGuard)
	@SubscribeMessage('joinRoom')
	async joinRoom(
		@MessageBody() data: { user: number; chanId: number },
		@ConnectedSocket() client: Socket
	) {
		await this.channelsService.joinChan(data.user, data.chanId);
		const sockets: Socket[] = this.usersSockets.get(data.user);
		// On fait join la room a tous les sockets connected de this user
		sockets?.forEach((s) => s.join(`${data.chanId}`));
		// On annonce a tous les sockets / users de ce channel que quelqu'un a join
		this.server
			.to(`${data.chanId}`)
			.emit('someoneJoinedRoom', data.chanId, data.user);
		return 'success';
	}

	// Emit a tous les clients que quelqu'un a join
	@SubscribeMessage('someoneJoinedRoom')
	onSomeoneJoinedRoom(
		@MessageBody() chanId: number,
		@ConnectedSocket() client: Socket
	) {
		const sockets: Socket[] = this.usersSockets.get(
			client.data.accessToken.userId
		);
		// On fait join la room a tous les sockets connected de this user
		sockets.forEach((s) => s.join(`${chanId}`));
		// On annonce a tous les sockets / users de ce channel que quelqu'un a join SAUF au sender
		client.broadcast
			.to(`${chanId}`)
			.emit('someoneJoinedRoom', chanId, client.data.accessToken.userId);
	}

	// Emit a tous les clients qu'une room a ete deleted
	@SubscribeMessage('chanDeleted')
	onChanDeleted(
		@MessageBody() chanId: number,
		@ConnectedSocket() client: Socket
	) {
		this.server.emit('chanDeleted', chanId);
	}

	// Emit a tous les clients qu'une room a ete created et fait join au createur
	// le channel
	@SubscribeMessage('chanCreated')
	onChanCreated(
		@MessageBody() chanId: number,
		@ConnectedSocket() client: Socket
	) {
		const sockets: Socket[] = this.usersSockets.get(
			client.data.accessToken.userId
		);
		sockets.forEach((s) => s.join(`${chanId}`));
		this.server.emit('chanCreated', chanId);
	}

	// Emit a tous les clients qu'une room a ete created
	@SubscribeMessage('chanEdited')
	onChanEdited(
		@MessageBody() chanId: number,
		@ConnectedSocket() client: Socket
	) {
		this.server.emit('chanEdited', chanId);
	}

	// Emit a tous les clients de la room que quelqu'un a leave
	@SubscribeMessage('userLeftChan')
	onLeftChan(
		@MessageBody() chanId: number,
		@ConnectedSocket() client: Socket
	) {
		this.server
			.to(`${chanId}`)
			.emit('userLeftChan', chanId, client.data.accessToken.userId);

		const sockets: Socket[] = this.usersSockets.get(
			client.data.accessToken.userId
		);
		sockets.forEach((s) => s.leave(`${chanId}`));
	}

	@SubscribeMessage('joinProtectedRoom')
	async joinProtectedRoom(
		@MessageBody() data: { user: number; chanId: number; pwd: string },
		@ConnectedSocket() client: Socket
	) {
		const hash: string = await this.channelsService.getHash(+data.chanId);
		const compare: boolean = await bcrypt.compare(data.pwd, hash);
		try {
			if (compare === false) {
				throw new Error('badPassword');
			}
			//TODO
			//check pwd
			this.joinRoom({ user: data.user, chanId: data.chanId }, client);
			this.server.emit('validPassword');
		} catch (err) {
			this.server.emit('badPassword');
		}
	}

	sendToRoom(data: { user: string; msg: string; chanId: string }) {
		this.server.to(data.chanId).emit('afterNewMessage', {
			user: data.user,
			message: data.msg,
		});
	}

	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@UseGuards(OptTargetGuard)
	@SubscribeMessage('ban')
	async onBan(@MessageBody() data: { targetId: string; chanId: string }) {
		await this.channelsService.banUserOnChan(+data.targetId, +data.chanId);
		// FIXME: POURQUOI data.chanId et data.chanId.toString() ne marchent pas??
		this.server
			.to(`${data.chanId}`)
			.emit('someoneHasBeenBanned', data.targetId, data.chanId);

		const sockets: Socket[] = this.usersSockets.get(+data.targetId);
		sockets.forEach((s) => s.leave(`${data.chanId}`));
	}

	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@SubscribeMessage('kick')
	@UseGuards(OptTargetGuard)
	async onKick(@MessageBody() data: { targetId: string; chanId: string }) {
		await this.channelsService.kickUserOnchan(+data.targetId, +data.chanId);
		this.server
			.to(`${data.chanId}`)
			.emit('someoneHasBeenKicked', data.targetId, data.chanId);

		const sockets: Socket[] = this.usersSockets.get(+data.targetId);
		sockets.forEach((s) => s.leave(`${data.chanId}`));
	}

	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@SubscribeMessage('mute')
	@UseGuards(OptTargetGuard)
	async onMute(
		@MessageBody() data: { targetId: string; chanId: string },
		@ConnectedSocket() client: Socket
	) {
		await this.channelsService.muteUserOnChan(+data.targetId, +data.chanId);
		return 'Succes';
	}

	@SubscribeMessage('block')
	@UseGuards(OptTargetGuard)
	async onBlock(
		@MessageBody() targetId: string,
		@ConnectedSocket() client: Socket
	) {
		await this.usersService.addBlockedUser(
			client.data.accessToken.userId,
			+targetId
		);
		return 'Succes';
	}

	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@SubscribeMessage('giveRights')
	@UseGuards(OptTargetGuard)
	async onGiveRights(
		@MessageBody() data: { targetId: number; chanId: number },
		@ConnectedSocket() client: Socket
	) {
		await this.channelsService.changeRights(
			data.targetId,
			data.chanId,
			roleChannel.ADMIN
		);
		return {
			status: 'OK',
			data: { userId: data.targetId, chanId: data.chanId },
		};
	}

	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@SubscribeMessage('removeRights')
	@UseGuards(OptTargetGuard)
	async onRemoveRights(
		@MessageBody() data: { targetId: number; chanId: number },
		@ConnectedSocket() client: Socket
	) {
		await this.channelsService.changeRights(
			data.targetId,
			data.chanId,
			roleChannel.USER
		);
		return {
			status: 'OK',
			data: { userId: data.targetId, chanId: data.chanId },
		};
	}

	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@SubscribeMessage('changeRights')
	@UseGuards(OptTargetGuard)
	async onChangeRights(
		@MessageBody() data: { targetId: number; chanId: number },
		@ConnectedSocket() client: Socket
	) {
		let currRole = (
			await this.channelsService.findUserOnChan(
				data.targetId,
				data.chanId
			)
		).role;
		if (currRole === 'ADMIN') currRole = 'USER';
		else if (currRole === 'USER') currRole = 'ADMIN';
		await this.channelsService.changeRights(
			data.targetId,
			data.chanId,
			currRole
		);
		this.server
			.to(`${data.chanId}`)
			.emit('rightsEdited', data.targetId, data.chanId);
		return {
			status: 'OK',
			data: {
				userId: data.targetId,
				chanId: data.chanId,
				role: currRole,
			},
		};
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

	protected async makeClientJoinSusChannels(client: Socket) {
		const getUserChan = await this.usersService.findChannel(
			client.data.accessToken.userId
		);

		client.join(
			Array.from(getUserChan.channelsProfiles)
				.filter((channelProfile) => channelProfile.role !== 'BAN')
				.map((channelProfile) => `${channelProfile.channelId}`)
		);
	}

	protected async emitToFriends(userId: number, eventToEmit: string) {
		const friendOf: User[] = await this.usersService.getFriendsOf(userId);
		friendOf.map((user) => {
			const friendSockets: Socket[] = this.usersSockets.get(user.id);
			if (!friendSockets) return ;
			friendSockets.map((socket) => {
				this.server.to(socket.id).emit(eventToEmit, {user: userId});
			});
		});
	}
}
