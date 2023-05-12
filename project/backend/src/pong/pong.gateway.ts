import { Logger, UseGuards } from '@nestjs/common';
import { SocketGuard } from 'src/guards/socket.guard';
import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	ConnectedSocket,
	MessageBody,
	WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 } from 'uuid';
import { GameService } from '../game/game.service';
import { Inject } from '@nestjs/common';
import { gameMode, invitMode } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { instanceOfToken } from '../type/token.type';
import { InvitationsService } from '../invitations/invitations.service';
import { CreateInvitationDto } from '../invitations/dto/create-invitation.dto';
import { get } from 'http';

const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 500;
const BALL_RADIUS = 10;
const BALL_SPEED = 0.4;
const INCREASE_SPEED = 0.02;
const WALL_WIDTH = 10;
const WALL_HEIGH = BOARD_HEIGHT;
const WALL_PLAYER1 = BOARD_WIDTH * 0.33;
const WALL_PLAYER2 = BOARD_WIDTH * 0.66;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BONUS_WIDTH = 50;
const BONUS_HEIGHT = 50;
const BONUS_SPEED = 0.2;
const TIME_LEFT = 5;
const TIME_LEFT_BLOC_BONUS = 5;
const SCORE_LIMIT = 11;
const STROKE = 2;
const TIME_LAUNCH_BALL = 2;

const spells = [
	{
		name: 'Super strike',
		type: 1,
		effect_player: 'strike',
		effect_ball: 'Effet',
		speed: 4,
		color: 'Gold',
	},
	{
		name: 'Mind control',
		type: 2,
		effect_player: 'mind_control',
		effect_ball: 'Effet',
		speed: 1,
		color: 'Purple',
	},
	{
		name: 'Swing',
		type: 1,
		effect_player: 'swing',
		effect_ball: 'Effet',
		speed: 2,
		color: 'Green',
	},
	{
		name: 'The wall',
		type: 2,
		effect_player: 'wall',
		effect_ball: 'Effet',
		speed: 1,
		color: 'Red',
	},
];

interface Spell {
	name: string;
	type: number;
	effect_player: string;
	effect_ball: string;
	speed: number;
	color: string;
}

interface PlayerState {
	player1Position: { x: number; y: number };
	player2Position: { x: number; y: number };
	player1Score: number;
	player2Score: number;
	player1GetBonus: boolean;
	player2GetBonus: boolean;
	player1ActivateBonus: boolean;
	player2ActivateBonus: boolean;
	whichSpellPlayer1: Spell | null;
	whichSpellPlayer2: Spell | null;
	player1Ready: boolean;
	player2Ready: boolean;
}

interface BallState {
	ballPosition: { x: number; y: number };
	ballDirection: { x: number; y: number };
	ballSpeed: number;
	ballPower: boolean;
}

interface BonusState {
	bonusPosition: { x: number; y: number };
	bonusPosition2: { x: number; y: number };
	showBonus: boolean;
	showBonus2: boolean;
	selectedSpell: Spell | null;
	selectedSpell2: Spell | null;
	wall: boolean;
	wall2: boolean;
	timeLeftMindControl: number;
	timeLeftMindControl2: number;
	timeLeftWall: number;
	timeLeftWall2: number;
	heightPaddle: boolean;
	heightPaddle2: boolean;
	heightPaddleScale: number;
	heightPaddleScale2: number;
	timeLeft: number;
	timeLeft2: number;
}

interface GameState {
	endGame: boolean;
	isPlaying: boolean;
}
@WebSocketGateway({
	cors: {
		origin: '*',
	},
	namespace: 'pong',
})
@UseGuards(SocketGuard)
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		@Inject(GameService) private gameService: GameService,
		private readonly jwt: JwtService,
		private readonly invitationsService: InvitationsService
	) {}
	@WebSocketServer()
	server: Server;

	private queueClassic: { id: string; socket: Socket }[] = [];
	private queuePower: { id: string; socket: Socket }[] = [];
	private socket: any[] = [];
	private players: {
		client: Socket;
		side: string;
		room: string;
		mode: string;
	}[] = [];
	private rooms: Map<string, { client: Socket; side: string }[]> = new Map();

	private player: Map<string, PlayerState> = new Map();
	private ball: Map<string, BallState> = new Map();
	private bonus: Map<string, BonusState> = new Map();
	private game: Map<string, GameState> = new Map();
	private gameIdPrisma: Map<string, number> = new Map();

	private logger: Logger = new Logger('AppGateway');
	private usersSockets: Map<number, Socket[]> = new Map<number, Socket[]>();
	private invitMap: Map<number, Socket> = new Map<number, Socket>();

	async handleConnection(client: Socket) {
		this.logger.log('New player connected: ' + client.id);
		this.socket.push({ id: client.id });

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

		// On ajoute le socket au user dans la Map usersSockets
		const sockets =
			this.usersSockets.get(client.data.accessToken.userId) || [];

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

	handleDisconnect(client: Socket) {
		this.logger.log('Player disconnected: ' + client.id);
		//DELETE usersSockets
		const sockets =
			this.usersSockets.get(client.data.accessToken.userId) || [];
		const index = sockets.findIndex((socket) => socket.id === client.id);
		if (index !== -1) {
			sockets.splice(index, 1);
		}
		this.usersSockets.set(client.data.accessToken.userId, sockets);

		//DELETE invitSocket
		let keyToDelete = null;
		for (const [key, value] of this.invitMap.entries()) {
			if (value === client) {
				keyToDelete = key;
				break;
			}
		}
		if (keyToDelete !== null) {
			this.invitMap.delete(keyToDelete);
		}

		this.socket = this.socket.filter((player) => player.id !== client.id);
		this.queueClassic = this.queueClassic.filter(
			(player) => player.id !== client.id
		);
		this.queuePower = this.queuePower.filter(
			(player) => player.id !== client.id
		);

		const socket = client;
		const player = this.players.find((client) => client.client === socket);

		if (player) {
			if (this.game.has(player.room) && this.player.has(player.room)) {
				const playerState = this.player.get(player.room);
				const game = this.game.get(player.room);
				const side = player.side === 'left' ? 'right' : 'left';
				const arrayRoom = this.rooms.get(player.room);
				if (arrayRoom) {
					if (arrayRoom.length > 1) {
						const player1Room = arrayRoom.find(
							(player) => player.side === 'left'
						);
						const player2Room = arrayRoom.find(
							(player) => player.side === 'right'
						);
						const player1Socket = player1Room.client;
						const player2Socket = player2Room.client;
						const player1Id = player1Socket.data.accessToken.userId;
						const player2Id = player2Socket.data.accessToken.userId;
						const player1 = {
							id: player1Id,
							score: playerState.player1Score,
						};
						const player2 = {
							id: player2Id,
							score: playerState.player2Score,
						};
						const gameId = this.gameIdPrisma.get(player.room);

						this.gameService.FinishGame(
							gameId,
							player1,
							player2,
							side === 'left' ? player1.id : player2.id
						);
					}
					const indexPlayerArrayRoom = arrayRoom.findIndex(
						(index) => index.client === socket
					);
					if (indexPlayerArrayRoom !== -1)
						arrayRoom.splice(indexPlayerArrayRoom, 1);

					console.log('Player leave the pong:', client.id);

					this.rooms.set(player.room, arrayRoom);
					player.client.leave(player.room);
					this.players = this.players.filter(
						(players) => players.client !== player.client
					);
					this.server.to(player.room).emit('playerLeavePong', true);
					this.server.to(player.room).emit('playerWinLose', side);
					game.isPlaying = false;
					this.game.set(player.room, game);

					if (arrayRoom.length < 1) {
						this.rooms.delete(player.room);
						this.player.delete(player.room);
						this.ball.delete(player.room);
						this.bonus.delete(player.room);
						this.game.delete(player.room);
						this.gameIdPrisma.delete(player.room);
					}
				}
			}
		}
	}

  getDefaultPlayerState(): PlayerState
  {
    return {
      player1Position: {x: 20, y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2},
      player2Position: {x: BOARD_WIDTH - 30, y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2},
      player1Score: 0,
      player2Score: 0,
      player1GetBonus: false,
      player2GetBonus: false,
      player1ActivateBonus: false,
      player2ActivateBonus: false,
      whichSpellPlayer1: null,
      whichSpellPlayer2: null,
      player1Ready: false,
      player2Ready: false,
    };
  };

  getDefaultBallState(): BallState
  {
    return {
      ballPosition: {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2,},
      ballDirection: {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 0.5 : -0.5},
      ballSpeed: (BALL_SPEED),
      ballPower: false
    };
  }

  getDefaultBonusState(): BonusState
  {
    return {
      bonusPosition: {x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT - 5},
      bonusPosition2: {x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT - 5},
      showBonus: true,
      showBonus2: true,
      selectedSpell: spells[Math.floor(Math.random() * 4)],
      selectedSpell2: spells[Math.floor(Math.random() * 4)],
      wall: false,
      wall2: false,
      timeLeftMindControl: 0,
      timeLeftMindControl2: 0,
      timeLeftWall: 0,
      timeLeftWall2: 0,
      heightPaddle: false,
      heightPaddle2: false,
      heightPaddleScale: PADDLE_HEIGHT,
      heightPaddleScale2: PADDLE_HEIGHT,
      timeLeft: TIME_LEFT,
      timeLeft2: TIME_LEFT
    };
  }

  getDefaultGameState(): GameState
  {
    return {
      endGame: false,
      isPlaying: false,
    };
  }


  async waitForPageLoad(client1: Socket, client2: Socket) {
    return new Promise<void>((resolve) => {
      let loadedClients = 0;

      const handleLoaded = () => {
        loadedClients++;

        if (loadedClients === 2) {
          resolve();
        }
      };

      client1.once('pageLoaded', handleLoaded);
      client2.once('pageLoaded', handleLoaded);
    });
  }

  @SubscribeMessage('joinMatchmaking')
  async handleMatchmaking(client: Socket): Promise<void> {
    const player = {id: client.id, socket: client};
    this.queueClassic.push(player);
    console.log(`Player ${client.id} joined the queue for classic Pong.`);

    if (this.queueClassic.length >= 2) {
      const player1 = this.queueClassic.shift();
      const player2 = this.queueClassic.shift();
      const player1IdPrisma = player1.socket.data.accessToken.userId;
      const player2IdPrisma = player2.socket.data.accessToken.userId;
      if (player1IdPrisma === player2IdPrisma)
      {
        console.log(`Can't match players. ${player1.id} and ${player2.id} are the same user.`);
        this.queueClassic.push(player1);
        return;
      }
      console.log(`Matching players ${player1.id} and ${player2.id}.`);

      const gameId = v4();
      const room = `room-${gameId}`;

      const playersRoom = [
        { client: player1.socket, side: 'left' },
        { client: player2.socket, side: 'right' },
      ];
      this.rooms.set(room, playersRoom);

      const player1array = {client: player1.socket, side: 'left', room: room, mode: 'classic'}
      const player2array = {client: player2.socket, side: 'right', room: room, mode: 'classic'}

      this.players.push(player1array);
      this.players.push(player2array);

      player1.socket.join(room);
      player2.socket.join(room);
      player1.socket.to(room).emit('launchOn', true);
      player2.socket.to(room).emit('launchOn', true);

      await this.waitForPageLoad(player1.socket, player2.socket);

      const gameIdPrisma = await this.gameService.createGame(player1IdPrisma, player2IdPrisma, gameMode.CLASSIC);

      player1.socket.to(room).emit('room', {roomId: room});
      player2.socket.to(room).emit('room', {roomId: room});
      player1.socket.to(room).emit('side', {side: 'right'});
      player2.socket.to(room).emit('side', {side: 'left'});

      console.log(`New game started with id ${gameId}.`);

      this.player.set(room, this.getDefaultPlayerState());
      this.ball.set(room, this.getDefaultBallState());
      this.bonus.set(room, this.getDefaultBonusState());
      this.game.set(room, this.getDefaultGameState());
      this.gameIdPrisma.set(room, gameIdPrisma);
    }
  }

  @SubscribeMessage('leaveMatchmaking')
  quitMatchmaking(client: Socket): void {
    const player = {id: client.id, socket: client};
    const index = this.queueClassic.findIndex(client => client.id === player.id);
    if (index !== -1)
    {
      this.queueClassic.splice(index, 1);
      console.log(`Player ${client.id} leave the queue for classic Pong.`);
    }
  }

  @SubscribeMessage('joinMatchmakingPowerUp')
  async handleMatchmakingPowerUp(client: Socket): Promise<void> {
    const player = {id: client.id, socket: client};
    this.queuePower.push(player);
    console.log(`Player ${client.id} joined the queue for power Pong.`);

    if (this.queuePower.length >= 2) {
      const player1 = this.queuePower.shift();
      const player2 = this.queuePower.shift();
      const player1IdPrisma = player1.socket.data.accessToken.userId;
      const player2IdPrisma = player2.socket.data.accessToken.userId;
      if (player1IdPrisma === player2IdPrisma)
      {
        console.log(`Can't match players. ${player1.id} and ${player2.id} are the same user.`);
        this.queuePower.push(player1);
        return;
      }
      console.log(`Matching players ${player1.id} and ${player2.id}.`);

      const gameId = v4();
      const room = `room-${gameId}`;
      const playersRoom = [
        { client: player1.socket, side: 'left' },
        { client: player2.socket, side: 'right' },
      ];
      this.rooms.set(room, playersRoom);

      const player1array = {client: player1.socket, side: 'left', room: room, mode: 'power'}
      const player2array = {client: player2.socket, side: 'right', room: room, mode: 'power'}

      this.players.push(player1array);
      this.players.push(player2array);

      player1.socket.join(room);
      player2.socket.join(room);
      player1.socket.to(room).emit('launchOn', true);
      player2.socket.to(room).emit('launchOn', true);

      await this.waitForPageLoad(player1.socket, player2.socket);

      const gameIdPrisma = await this.gameService.createGame(player1IdPrisma, player2IdPrisma, gameMode.POWER);

      player1.socket.to(room).emit('room', {roomId: room});
      player2.socket.to(room).emit('room', {roomId: room});
      player1.socket.to(room).emit('side', {side: 'right'});
      player2.socket.to(room).emit('side', {side: 'left'});
      player1.socket.to(room).emit('power', {power: true});
      player2.socket.to(room).emit('power', {power: true});

      console.log(`New game started with id ${gameId}.`);

      this.player.set(room, this.getDefaultPlayerState());
      this.ball.set(room, this.getDefaultBallState());
      this.bonus.set(room, this.getDefaultBonusState());
      this.game.set(room, this.getDefaultGameState());
      this.gameIdPrisma.set(room, gameIdPrisma);
    }
  }

  @SubscribeMessage('leaveMatchmakingPowerUp')
  quitMatchmakingPowerUp(client: Socket): void {
    const player = {id: client.id, socket: client};
    const index = this.queuePower.findIndex(client => client.id === player.id);
    if (index !== -1)
    {
      this.queuePower.splice(index, 1);
      console.log(`Player ${client.id} leave the queue for power Pong.`);
    }
  }

  @SubscribeMessage('leavePong')
  handleLeavePong(@ConnectedSocket() client: Socket)
  {
    const socket = client;
    const player = this.players.find(client => client.client === socket);

    if (player)
    {
      if (this.game.has(player.room) && this.player.has(player.room))
      {
        const playerState = this.player.get(player.room);
        const game = this.game.get(player.room);
        const side = player.side === 'left' ? 'right' : 'left';
        const arrayRoom = this.rooms.get(player.room);
        if (arrayRoom)
        {
          if (arrayRoom.length > 1)
          {
            const player1Room = arrayRoom.find(player => player.side === 'left');
            const player2Room = arrayRoom.find(player => player.side === 'right');
            const player1Socket = player1Room.client;
            const player2Socket = player2Room.client;
            const player1Id = player1Socket.data.accessToken.userId;
            const player2Id = player2Socket.data.accessToken.userId;
            const player1 = {id: player1Id, score: playerState.player1Score};
            const player2 = {id: player2Id, score: playerState.player2Score};
            const gameId = this.gameIdPrisma.get(player.room);

            this.gameService.FinishGame(gameId, player1, player2, side === 'left' ? player1.id : player2.id);
          }
          const indexPlayerArrayRoom = arrayRoom.findIndex(index => index.client === socket);
          if (indexPlayerArrayRoom !== -1)
            arrayRoom.splice(indexPlayerArrayRoom, 1);

          console.log('Player leave the pong:', client.id);

          this.rooms.set(player.room, arrayRoom);
          player.client.leave(player.room);
          this.players = this.players.filter(players => players.client !== player.client);
          this.server.to(player.room).emit('playerLeavePong', true);
          this.server.to(player.room).emit('playerWinLose', side);
          game.isPlaying = false;
          this.game.set(player.room, game);

          if (arrayRoom.length < 1)
          {
            this.rooms.delete(player.room);
            this.player.delete(player.room);
            this.ball.delete(player.room);
            this.bonus.delete(player.room);
            this.game.delete(player.room);
            this.gameIdPrisma.delete(player.room);
          }
        }
      }
    }
  }

  @SubscribeMessage('joinMatchmakingChat')
  async handleMatchmakingChat(client: Socket): Promise<void> {
    const player = {id: client.id, socket: client};
    this.queueClassic.push(player);
    console.log(`Player ${client.id} joined the queue for classic Pong.`);

    if (this.queueClassic.length >= 2) {
      const player1 = this.queueClassic.shift();
      const player2 = this.queueClassic.shift();
      console.log(`Matching players ${player1.id} and ${player2.id}.`);

      const gameId = v4();
      const room = `room-${gameId}`;

      const playersRoom = [
        { client: player1.socket, side: 'left' },
        { client: player2.socket, side: 'right' },
      ];
      this.rooms.set(room, playersRoom);

      const player1array = {client: player1.socket, side: 'left', room: room, mode: 'classic'}
      const player2array = {client: player2.socket, side: 'right', room: room, mode: 'classic'}

      this.players.push(player1array);
      this.players.push(player2array);

      player1.socket.join(room);
      player2.socket.join(room);
      player1.socket.to(room).emit('launchOn', true);
      player2.socket.to(room).emit('launchOn', true);

      await this.waitForPageLoad(player1.socket, player2.socket);

      const player1IdPrisma = player1.socket.data.accessToken.userId;
      const player2IdPrisma = player2.socket.data.accessToken.userId;

      const gameIdPrisma = await this.gameService.createGame(player1IdPrisma, player2IdPrisma, gameMode.CLASSIC);

      player1.socket.to(room).emit('room', {roomId: room});
      player2.socket.to(room).emit('room', {roomId: room});
      player1.socket.to(room).emit('side', {side: 'right'});
      player2.socket.to(room).emit('side', {side: 'left'});

      console.log(`New game started with id ${gameId}.`);

      this.player.set(room, this.getDefaultPlayerState());
      this.ball.set(room, this.getDefaultBallState());
      this.bonus.set(room, this.getDefaultBonusState());
      this.game.set(room, this.getDefaultGameState());
      this.gameIdPrisma.set(room, gameIdPrisma);
    }
  }


  @SubscribeMessage('launchSpell')
  manageLaunchSpell(@ConnectedSocket() socket: Socket, @MessageBody() data: { roomId: string, side: string }): void
  {
    const{roomId, side} = data;
    if (this.player.has(roomId) && this.bonus.has(roomId))
    {
      const player = this.player.get(roomId);
      const bonus = this.bonus.get(roomId);

      if (side === 'left' && player.player1GetBonus)
      {
        player.player1ActivateBonus = true;
        player.player1GetBonus = false;
        socket.to(roomId).emit("launchAudio");
      }
      else if (side === 'right' && player.player2GetBonus)
      {
        player.player2ActivateBonus = true;
        player.player2GetBonus = false;
        socket.to(roomId).emit("launchAudio");
      }

      this.player.set(roomId, player);
      this.bonus.set(roomId, bonus);
    }
  }

  @SubscribeMessage('mousePosition')
  manageMousePosition(@ConnectedSocket() socket: Socket, @MessageBody() data: { roomId: string, side: string, mousePos: {x: number, y: number} }): void
  {
    const{roomId, side, mousePos} = data;
    if (this.player.has(roomId) && this.bonus.has(roomId))
    {
      const player = this.player.get(roomId);
      const bonus = this.bonus.get(roomId);

      if (side === 'left')
      {
        if (mousePos.y + bonus.heightPaddleScale < BOARD_HEIGHT && mousePos.y > 0)
          player.player1Position = {x: player.player1Position.x, y: mousePos.y}
        else if (mousePos.y + bonus.heightPaddleScale > BOARD_HEIGHT)
          player.player1Position = {x: player.player1Position.x, y: BOARD_HEIGHT - bonus.heightPaddleScale}
        else if (mousePos.y < 0)
          player.player1Position = {x: player.player1Position.x, y: 0}
      }
      else if (side === 'right')
      {
        if (mousePos.y + bonus.heightPaddleScale2 < BOARD_HEIGHT && mousePos.y > 0)
          player.player2Position = {x: player.player2Position.x, y: mousePos.y}
        else if (mousePos.y + bonus.heightPaddleScale2 > BOARD_HEIGHT)
          player.player2Position = {x: player.player2Position.x, y: BOARD_HEIGHT - bonus.heightPaddleScale2}
        else if (mousePos.y < 0)
          player.player2Position = {x: player.player2Position.x, y: 0}
      }

      this.player.set(roomId, player);
      this.bonus.set(roomId, bonus);
    }
  }


  @SubscribeMessage('playerReady')
  managePlayerReady(@ConnectedSocket() socket: Socket, @MessageBody() data: { roomId: string, side: string }): void
  {
    const{roomId, side} = data;
    let timeOutBall
    if (this.player.has(roomId) && this.game.has(roomId))
    {
      const player = this.player.get(roomId);
      const game = this.game.get(roomId);

      if (side === 'left')
      {
        socket.to(roomId).emit('otherPlayerReady')
        player.player1Ready = true;
      }
      else if (side === "right")
      {
        socket.to(roomId).emit('otherPlayerReady')
        player.player2Ready = true;
      }

      if (player.player1Ready && player.player2Ready)
      {
        // game.isPlaying = true;
        timeOutBall = setTimeout(() => {
          game.isPlaying = true;
        }, TIME_LAUNCH_BALL * 1000);
      }

      this.player.set(roomId, player);
      this.game.set(roomId, game);
    }
  }

  @SubscribeMessage("startGamePowerUp")
  startGamePower(@ConnectedSocket() socket: Socket, @MessageBody() data: { roomId: string }): void
  {
    const{roomId} = data;
    if (this.player.has(roomId) && this.ball.has(roomId) && this.bonus.has(roomId) && this.game.has(roomId))
    {
      const player = this.player.get(roomId);
      const ball = this.ball.get(roomId);
      const bonus = this.bonus.get(roomId);
      const game = this.game.get(roomId);
      let timeOutWall, timeOutWall2, timeOutMind, timeOutMind2;

      this.server.to(roomId).emit('updatePowerUp', {player: player, ball: ball, bonus: bonus, game: game});

      if (player.player1Score >= SCORE_LIMIT || player.player2Score >= SCORE_LIMIT)
      {
        const side = player.player1Score >= SCORE_LIMIT ? 'left' : 'right';
        bonus.showBonus = false;
        bonus.showBonus2 = false;
        player.player1GetBonus = false;
        player.player2GetBonus = false;
        game.isPlaying = false;
        game.endGame = true;
        this.server.to(roomId).emit('playerWinLose', side);
        const arrayRoom = this.rooms.get(roomId);
        if (arrayRoom)
        {
          const player1Room = arrayRoom.find(player => player.side === 'left');
          const player2Room = arrayRoom.find(player => player.side === 'right');
          const player1Socket = player1Room.client;
          const player2Socket = player2Room.client;
          const player1Id = player1Socket.data.accessToken.userId;
          const player2Id = player2Socket.data.accessToken.userId;
          const player1 = {id: player1Id, score: player.player1Score};
          const player2 = {id: player2Id, score: player.player2Score};
          const gameId = this.gameIdPrisma.get(roomId);

          this.gameService.FinishGame(gameId, player1, player2);

          console.log('Player leave the pong:', player1Socket.id);
          console.log('Player leave the pong:', player2Socket.id);

          player1Socket.leave(roomId);
          player2Socket.leave(roomId);
          this.players = this.players.filter(players => players.client !== player1Socket);
          this.players = this.players.filter(players => players.client !== player2Socket);

          this.game.set(roomId, game);
        }
      }

      if (game.endGame)
      {
        this.rooms.delete(roomId);
        this.player.delete(roomId);
        this.ball.delete(roomId);
        this.bonus.delete(roomId);
        this.game.delete(roomId);
        this.gameIdPrisma.delete(roomId);
        return;
      }

      if (!game.isPlaying)
        return;

      if (player.player1ActivateBonus)
      {
        if (player.whichSpellPlayer1?.name == "Mind control")
        {
          bonus.timeLeftMindControl = 5;
          bonus.heightPaddleScale2 = PADDLE_HEIGHT / 2;
          player.whichSpellPlayer1 = null;
          player.player1ActivateBonus = false;
          bonus.heightPaddle2 = true;
          timeOutMind = setTimeout(() => {
            bonus.heightPaddle2 = false;
            bonus.heightPaddleScale2 = PADDLE_HEIGHT;
            player.whichSpellPlayer1 = null;
          }, TIME_LEFT * 1000);
        }
        else if (player.whichSpellPlayer1?.name == "The wall")
        {
          bonus.timeLeftWall = 5;
          player.whichSpellPlayer1 = null;
          player.player1ActivateBonus = false;
          bonus.wall = true;
          timeOutWall = setTimeout(() => {
            bonus.wall = false;
          }, TIME_LEFT * 1000);
        }
      }
      else if (player.player2ActivateBonus)
      {
        if (player.whichSpellPlayer2?.name == "Mind control")
        {
          bonus.timeLeftMindControl2 = 5;
          bonus.heightPaddleScale = PADDLE_HEIGHT / 2;
          player.whichSpellPlayer2 = null;
          player.player2ActivateBonus = false;
          bonus.heightPaddle = true;
          timeOutMind2 = setTimeout(() => {
            bonus.heightPaddle = false;
            bonus.heightPaddleScale = PADDLE_HEIGHT;
            player.whichSpellPlayer2 = null;
          }, TIME_LEFT * 1000);
        }
        else if (player.whichSpellPlayer2?.name == "The wall")
        {
          bonus.timeLeftWall2 = 5;
          player.whichSpellPlayer2 = null;
          player.player2ActivateBonus = false;
          bonus.wall2 = true;
          timeOutWall2 = setTimeout(() => {
            bonus.wall2 = false;
          }, TIME_LEFT * 1000);
        }
      }

      // hitBonus();
      const distance = Math.sqrt(Math.pow((ball.ballPosition.x - bonus.bonusPosition.x), 2) + Math.pow((ball.ballPosition.y - bonus.bonusPosition.y), 2));
      const distance2 = Math.sqrt(Math.pow((ball.ballPosition.x - bonus.bonusPosition2.x), 2) + Math.pow((ball.ballPosition.y - bonus.bonusPosition2.y), 2));

      if (ball.ballDirection.x > 0)
      {
        if (bonus.showBonus)
        {
          if (distance <= BONUS_WIDTH / 2 + BONUS_HEIGHT / 2)
          {
            bonus.showBonus = false;
            player.player1GetBonus = true;
            if (player.whichSpellPlayer1 === null)
            player.whichSpellPlayer1 = Object.assign({}, bonus.selectedSpell);
            bonus.bonusPosition = {x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT};
            bonus.selectedSpell = spells[Math.floor(Math.random() * 4)];
            bonus.timeLeft = TIME_LEFT;
            socket.to(roomId).emit("bonusAudio");
          }
        }
        else
        {
          setTimeout(() => {bonus.showBonus = true}, TIME_LEFT_BLOC_BONUS * 1000)
        }
        if (bonus.showBonus2)
        {
          if (distance2 <= BONUS_WIDTH / 2 + BONUS_HEIGHT / 2)
          {
            bonus.showBonus2 = false;
            player.player1GetBonus = true;
            if (player.whichSpellPlayer1 === null)
            player.whichSpellPlayer1 = Object.assign({}, bonus.selectedSpell2);
            bonus.bonusPosition2 = {x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT};
            bonus.selectedSpell2 = spells[Math.floor(Math.random() * 4)];
            bonus.timeLeft2 = TIME_LEFT;
            socket.to(roomId).emit("bonusAudio");
          }
        }
        else
        {
          setTimeout(() => {bonus.showBonus2 = true}, TIME_LEFT_BLOC_BONUS * 1000)
        }
      }
      else if (ball.ballDirection.x < 0)
      {
        if (bonus.showBonus)
        {
          if (distance <= BONUS_WIDTH / 2 + BONUS_HEIGHT / 2)
          {
            bonus.showBonus = false;
            player.player2GetBonus = true;
            if (player.whichSpellPlayer2 === null)
            player.whichSpellPlayer2 = Object.assign({}, bonus.selectedSpell);
            bonus.bonusPosition = {x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT};
            bonus.selectedSpell = spells[Math.floor(Math.random() * 4)];
            bonus.timeLeft = TIME_LEFT;
            socket.to(roomId).emit("bonusAudio");

          }
        }
        else
        {
          setTimeout(() => {bonus.showBonus = true}, TIME_LEFT_BLOC_BONUS * 1000)
        }
        if (bonus.showBonus2)
        {
          if (distance2 <= BONUS_WIDTH / 2 + BONUS_HEIGHT / 2)
          {
            bonus.showBonus2 = false;
            player.player2GetBonus = true;
            if (player.whichSpellPlayer2 === null)
            player.whichSpellPlayer2 = Object.assign({}, bonus.selectedSpell2);
            bonus.bonusPosition2 = {x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT};
            bonus.selectedSpell2 = spells[Math.floor(Math.random() * 4)];
            bonus.timeLeft2 = TIME_LEFT;
            socket.to(roomId).emit("bonusAudio");
          }
        }
        else
        {
          setTimeout(() => {bonus.showBonus2 = true}, TIME_LEFT_BLOC_BONUS * 1000)
        }
      }

      // hitScenery();
      if (ball.ballPosition.y - BALL_RADIUS <= 0 && ball.ballDirection.y < 0) // Touche le plafond
      {
        ball.ballDirection = {x: ball.ballDirection.x, y: -ball.ballDirection.y}
        socket.to(roomId).emit("wallsAudio");
      }
      else if (ball.ballPosition.y + BALL_RADIUS >= BOARD_HEIGHT && ball.ballDirection.y > 0) // Touche le sol
      {
        ball.ballDirection = {x: ball.ballDirection.x, y: -ball.ballDirection.y}
        socket.to(roomId).emit("wallsAudio");
      }
      else if (ball.ballPosition.x - BALL_RADIUS <= 0 && ball.ballDirection.x < 0) // Touche le mur gauche
      {
        player.player2Score += 1;
        ball.ballPosition = {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2}
        ball.ballDirection = {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 0.5 : -0.5}
        game.isPlaying = !game.isPlaying;
        player.player1GetBonus = false;
        player.player2GetBonus = false;
        player.player1ActivateBonus = false;
        player.player2ActivateBonus = false;
        bonus.showBonus = false;
        bonus.showBonus2 = false;
        bonus.heightPaddle2 = false;
        bonus.heightPaddle = false;
        bonus.heightPaddleScale2 = PADDLE_HEIGHT;
        bonus.heightPaddleScale = PADDLE_HEIGHT;
        ball.ballSpeed = BALL_SPEED;
        bonus.timeLeft = TIME_LEFT;
        bonus.timeLeft2 = TIME_LEFT;
        bonus.bonusPosition = {x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT};
        bonus.bonusPosition2 = {x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT};
        bonus.wall = false;
        bonus.wall2 = false;
        bonus.timeLeftMindControl = 0;
        bonus.timeLeftMindControl2 = 0;
        bonus.timeLeftWall = 0;
        bonus.timeLeftWall2 = 0;
        player.whichSpellPlayer1 = null;
        player.whichSpellPlayer2 = null;
        ball.ballPower = false;
        clearTimeout(timeOutWall);
        clearTimeout(timeOutWall2);
        clearTimeout(timeOutMind);
        clearTimeout(timeOutMind2);
        socket.to(roomId).emit("endAudio");
        setTimeout(() => {
          game.isPlaying = true;
        }, TIME_LAUNCH_BALL * 1000);
      }
      else if (ball.ballPosition.x + BALL_RADIUS >= BOARD_WIDTH && ball.ballDirection.x > 0) // Touche le mur droite
      {
        player.player1Score += 1;
        ball.ballPosition = {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2}
        ball.ballDirection = {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 0.5 : -0.5}
        game.isPlaying = !game.isPlaying;
        player.player1GetBonus = false;
        player.player2GetBonus = false;
        player.player1ActivateBonus = false;
        player.player2ActivateBonus = false;
        bonus.showBonus = false;
        bonus.showBonus2 = false;
        bonus.heightPaddle2 = false;
        bonus.heightPaddle = false;
        bonus.heightPaddleScale2 = PADDLE_HEIGHT;
        bonus.heightPaddleScale = PADDLE_HEIGHT;
        ball.ballSpeed = BALL_SPEED;
        bonus.timeLeft = TIME_LEFT;
        bonus.timeLeft2 = TIME_LEFT;
        bonus.bonusPosition = {x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT};
        bonus.bonusPosition2 = {x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT};
        bonus.wall = false;
        bonus.wall2 = false;
        bonus.timeLeftMindControl = 0;
        bonus.timeLeftMindControl2 = 0;
        bonus.timeLeftWall = 0;
        bonus.timeLeftWall2 = 0;
        player.whichSpellPlayer1 = null;
        player.whichSpellPlayer2 = null;
        ball.ballPower = false;
        clearTimeout(timeOutWall);
        clearTimeout(timeOutWall2);
        clearTimeout(timeOutMind);
        clearTimeout(timeOutMind2);
        socket.to(roomId).emit("endAudio");
        setTimeout(() => {
          game.isPlaying = true;
        }, TIME_LAUNCH_BALL * 1000);
      }
      else if (ball.ballPosition.x - BALL_RADIUS <= player.player1Position.x + PADDLE_WIDTH && ball.ballPosition.y >= player.player1Position.y && ball.ballPosition.y <= player.player1Position.y + bonus.heightPaddleScale && ball.ballDirection.x < 0)
      {
        if (ball.ballPower)
        {
          ball.ballPower = false;
          ball.ballSpeed = BALL_SPEED;
        }
        ball.ballSpeed += INCREASE_SPEED;
        if (ball.ballPosition.y > player.player1Position.y && ball.ballPosition.y < player.player1Position.y + (bonus.heightPaddleScale / 5) )
        {
          ball.ballDirection = {x: 1, y: Math.random() * -2.5};
        }
        else if (ball.ballPosition.y  >= player.player1Position.y + (bonus.heightPaddleScale / 5) && ball.ballPosition.y  < player.player1Position.y + (bonus.heightPaddleScale / 5) * 2 )
        {
          ball.ballDirection = {x: 1, y: Math.random() * -2};
        }
        else if (ball.ballPosition.y  >= player.player1Position.y + (bonus.heightPaddleScale / 5) * 2 && ball.ballPosition.y  < player.player1Position.y + bonus.heightPaddleScale - (bonus.heightPaddleScale / 5) )
        {
          ball.ballDirection = {x: 1, y: Math.random() * 2};
        }
        else if (ball.ballPosition.y  >= player.player1Position.y + bonus.heightPaddleScale - (bonus.heightPaddleScale / 5) && ball.ballPosition.y < player.player1Position.y + bonus.heightPaddleScale )
        {
          ball.ballDirection = {x: 1, y: Math.random() * 2.5};
        }
        else
        {
          ball.ballDirection = {x: 1, y: Math.random() * 0.5};
        }
        socket.to(roomId).emit("paddle1Audio");
        if (player.player1ActivateBonus)
        {
          if (player.whichSpellPlayer1?.name == "Super strike")
          {
            ball.ballDirection = {x: 1, y: 0};
            ball.ballSpeed = BALL_SPEED * player.whichSpellPlayer1?.speed;
            ball.ballPower = true;
          }
          else if (player.whichSpellPlayer1?.name == "Swing")
          {
            ball.ballDirection = {x: 0.2, y: 0.95};
            ball.ballSpeed = BALL_SPEED * player.whichSpellPlayer1?.speed;
            ball.ballPower = true;
          }
          player.player1ActivateBonus = false;
          player.whichSpellPlayer1 = null;
        }
      }
      else if (ball.ballPosition.x + BALL_RADIUS >= player.player2Position.x && ball.ballPosition.y >= player.player2Position.y && ball.ballPosition.y <= player.player2Position.y + bonus.heightPaddleScale2 && ball.ballDirection.x > 0)
      {
        if (ball.ballPower)
        {
          ball.ballPower = false;
          ball.ballSpeed = BALL_SPEED;
        }
        ball.ballSpeed += INCREASE_SPEED;
        if ( ball.ballPosition.y > player.player2Position.y && ball.ballPosition.y < player.player2Position.y + (bonus.heightPaddleScale2 / 5) )
        {
          ball.ballDirection = {x: -1, y: Math.random() * -2.5};
        }
        else if ( ball.ballPosition.y  >= player.player2Position.y + (bonus.heightPaddleScale2 / 5) && ball.ballPosition.y  < player.player2Position.y + (bonus.heightPaddleScale2 / 5) * 2 )
        {
          ball.ballDirection = {x: -1, y: Math.random() * -2};
        }
        else if ( ball.ballPosition.y  >= player.player2Position.y + (bonus.heightPaddleScale2 / 5) * 2 && ball.ballPosition.y  < player.player2Position.y + bonus.heightPaddleScale2 - (bonus.heightPaddleScale2 / 5) )
        {
          ball.ballDirection = {x: -1, y: Math.random() * 2};
        }
        else if ( ball.ballPosition.y  >= player.player2Position.y + bonus.heightPaddleScale2 - (bonus.heightPaddleScale2 / 5) && ball.ballPosition.y  < player.player2Position.y + bonus.heightPaddleScale2 )
        {
          ball.ballDirection = {x: -1, y: Math.random() * 2.5};
        }
        else
        {
          ball.ballDirection = {x: -1, y: Math.random() * 0.5};
        }
        socket.to(roomId).emit("paddle2Audio");
        if (player.player2ActivateBonus)
        {
          if (player.whichSpellPlayer2?.name == "Super strike")
          {
            ball.ballDirection = {x: -1, y: 0};
            ball.ballSpeed = BALL_SPEED * player.whichSpellPlayer2?.speed;
            ball.ballPower = true;
          }
          else if (player.whichSpellPlayer2?.name == "Swing")
          {
            ball.ballDirection = {x: -0.2, y: 0.95};
            ball.ballSpeed = BALL_SPEED * player.whichSpellPlayer2?.speed;
            ball.ballPower = true;
          }
          player.player2ActivateBonus = false;
          player.whichSpellPlayer2 = null;
        }
      }
      else if (bonus.wall && ball.ballDirection.x < 0 && ball.ballPosition.x - BALL_RADIUS <= WALL_PLAYER1 + WALL_WIDTH / 2 && ball.ballPosition.x - BALL_RADIUS >= WALL_PLAYER1 - WALL_WIDTH / 2)
      {
        ball.ballDirection = {x: -ball.ballDirection.x, y: ball.ballDirection.y}
        socket.to(roomId).emit("wallsAudio");
      }
      else if (bonus.wall2 && ball.ballDirection.x > 0 && ball.ballPosition.x + BALL_RADIUS >= WALL_PLAYER2 - WALL_WIDTH / 2 && ball.ballPosition.x + BALL_RADIUS <= WALL_PLAYER2 + WALL_WIDTH / 2)
      {
        ball.ballDirection = {x: -ball.ballDirection.x, y: ball.ballDirection.y}
        socket.to(roomId).emit("wallsAudio");
      }
      else
      {
        ball.ballPosition = {x: ball.ballPosition.x + ball.ballDirection.x * ball.ballSpeed, y: ball.ballPosition.y + ball.ballDirection.y * ball.ballSpeed}
      }

      // animateBonus();
      if (bonus.showBonus)
      {
        if (bonus.bonusPosition.y <= BOARD_HEIGHT)
          bonus.bonusPosition = {x: bonus.bonusPosition.x, y: bonus.bonusPosition.y + (BONUS_SPEED)}
        else
        {
          bonus.bonusPosition = {x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT}
          bonus.showBonus = false;
          setTimeout(() => {bonus.showBonus = true}, TIME_LEFT_BLOC_BONUS * 1000)
        }
      }

      if (bonus.showBonus2)
      {
        if (bonus.bonusPosition2.y <= BOARD_HEIGHT)
        bonus.bonusPosition2 = {x: bonus.bonusPosition2.x, y: bonus.bonusPosition2.y + (BONUS_SPEED)}
        else
        {
          bonus.bonusPosition2 = {x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT}
          bonus.showBonus2 = false;
          setTimeout(() => {bonus.showBonus2 = true}, TIME_LEFT_BLOC_BONUS * 1000);
        }
      }

      this.player.set(roomId, player);
      this.ball.set(roomId, ball);
      this.bonus.set(roomId, bonus);
      this.game.set(roomId, game);
    }
  }

  @SubscribeMessage("startGame")
  startGame(@ConnectedSocket() socket: Socket, @MessageBody() data: { roomId: string }): void
  {
    const{roomId} = data;

    if (this.player.has(roomId) && this.ball.has(roomId) && this.bonus.has(roomId) && this.game.has(roomId))
    {
      const player = this.player.get(roomId);
      const ball = this.ball.get(roomId);
      const bonus = this.bonus.get(roomId);
      const game = this.game.get(roomId);

      this.server.to(roomId).emit('update', {player: player, ball: ball, bonus: bonus, game: game});

      // checkEndGame();
      if (player.player1Score >= SCORE_LIMIT || player.player2Score >= SCORE_LIMIT)
      {
        const side = player.player1Score >= SCORE_LIMIT ? 'left' : 'right';
        game.isPlaying = false;
        game.endGame = true;
        this.server.to(roomId).emit('playerWinLose', side);
        const arrayRoom = this.rooms.get(roomId);
        if (arrayRoom)
        {
          const player1Room = arrayRoom.find(player => player.side === 'left');
          const player2Room = arrayRoom.find(player => player.side === 'right');
          const player1Socket = player1Room.client;
          const player2Socket = player2Room.client;
          const player1Id = player1Socket.data.accessToken.userId;
          const player2Id = player2Socket.data.accessToken.userId;
          const player1 = {id: player1Id, score: player.player1Score};
          const player2 = {id: player2Id, score: player.player2Score};
          const gameId = this.gameIdPrisma.get(roomId);

          this.gameService.FinishGame(gameId, player1, player2);

          console.log('Player leave the pong:', player1Socket.id);
          console.log('Player leave the pong:', player2Socket.id);

          player1Socket.leave(roomId);
          player2Socket.leave(roomId);
          this.players = this.players.filter(players => players.client !== player1Socket);
          this.players = this.players.filter(players => players.client !== player2Socket);

          this.game.set(roomId, game);
        }
      }

      if (game.endGame)
      {
        this.rooms.delete(roomId);
        this.player.delete(roomId);
        this.ball.delete(roomId);
        this.bonus.delete(roomId);
        this.game.delete(roomId);
        this.gameIdPrisma.delete(roomId);
        return;
      }

      if (!game.isPlaying)
        return;

      // hitScenery();
      if (ball.ballPosition.y - BALL_RADIUS <= 0 && ball.ballDirection.y < 0) // Touche le plafond
      {
        ball.ballDirection = {x: ball.ballDirection.x, y: -ball.ballDirection.y}
        socket.to(roomId).emit("wallsAudio");
      }
      else if (ball.ballPosition.y + BALL_RADIUS >= BOARD_HEIGHT && ball.ballDirection.y > 0) // Touche le sol
      {
        ball.ballDirection = {x: ball.ballDirection.x, y: -ball.ballDirection.y}
        socket.to(roomId).emit("wallsAudio");
      }
      else if (ball.ballPosition.x - BALL_RADIUS <= 0 && ball.ballDirection.x < 0) // Touche le mur gauche
      {
        player.player2Score += 1;
        ball.ballPosition = {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2}
        ball.ballDirection = {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 0.5 : -0.5}
        game.isPlaying = !game.isPlaying;
        player.player1GetBonus = false;
        player.player2GetBonus = false;
        player.player1ActivateBonus = false;
        player.player2ActivateBonus = false;
        ball.ballSpeed = BALL_SPEED;
        player.whichSpellPlayer1 = null;
        player.whichSpellPlayer2 = null;
        ball.ballPower = false;
        socket.to(roomId).emit("endAudio");
        setTimeout(() => {
          game.isPlaying = true;
        }, TIME_LAUNCH_BALL * 1000);
      }
      else if (ball.ballPosition.x + BALL_RADIUS >= BOARD_WIDTH && ball.ballDirection.x > 0) // Touche le mur droite
      {
        player.player1Score += 1;
        ball.ballPosition = {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2}
        ball.ballDirection = {x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 0.5 : -0.5}
        game.isPlaying = !game.isPlaying;
        player.player1GetBonus = false;
        player.player2GetBonus = false;
        player.player1ActivateBonus = false;
        player.player2ActivateBonus = false;
        ball.ballSpeed = BALL_SPEED;
        player.whichSpellPlayer1 = null;
        player.whichSpellPlayer2 = null;
        ball.ballPower = false;
        socket.to(roomId).emit("endAudio");
        setTimeout(() => {
          game.isPlaying = true;
        }, TIME_LAUNCH_BALL * 1000);
      }
      else if (ball.ballPosition.x - BALL_RADIUS <= player.player1Position.x + PADDLE_WIDTH && ball.ballPosition.y >= player.player1Position.y && ball.ballPosition.y <= player.player1Position.y + PADDLE_HEIGHT && ball.ballDirection.x < 0)
      {
        ball.ballPower = false;
        ball.ballSpeed += INCREASE_SPEED;
        if (ball.ballPosition.y > player.player1Position.y && ball.ballPosition.y < player.player1Position.y + (PADDLE_HEIGHT / 5) )
        {
          ball.ballDirection = {x: 1, y: Math.random() * -2.5};
        }
        else if (ball.ballPosition.y  >= player.player1Position.y + (PADDLE_HEIGHT / 5) && ball.ballPosition.y  < player.player1Position.y + (PADDLE_HEIGHT / 5) * 2 )
        {
          ball.ballDirection = {x: 1, y: Math.random() * -2};
        }
        else if (ball.ballPosition.y  >= player.player1Position.y + (PADDLE_HEIGHT / 5) * 2 && ball.ballPosition.y  < player.player1Position.y + PADDLE_HEIGHT - (PADDLE_HEIGHT / 5) )
        {
          ball.ballDirection = {x: 1, y: Math.random() * 2};
        }
        else if (ball.ballPosition.y  >= player.player1Position.y + PADDLE_HEIGHT - (PADDLE_HEIGHT / 5) && ball.ballPosition.y < player.player1Position.y + PADDLE_HEIGHT )
        {
          ball.ballDirection = {x: 1, y: Math.random() * 2.5};
        }
        else
        {
          ball.ballDirection = {x: 1, y: Math.random() * 0.5};
        }
        socket.to(roomId).emit("paddle1Audio");
      }
      else if (ball.ballPosition.x + BALL_RADIUS >= player.player2Position.x && ball.ballPosition.y >= player.player2Position.y && ball.ballPosition.y <= player.player2Position.y + PADDLE_HEIGHT && ball.ballDirection.x > 0)
      {
        ball.ballPower = false;
        ball.ballSpeed += INCREASE_SPEED;
        if ( ball.ballPosition.y > player.player2Position.y && ball.ballPosition.y < player.player2Position.y + (PADDLE_HEIGHT / 5) )
        {
          ball.ballDirection = {x: -1, y: Math.random() * -2.5};
        }
        else if ( ball.ballPosition.y  >= player.player2Position.y + (PADDLE_HEIGHT / 5) && ball.ballPosition.y  < player.player2Position.y + (PADDLE_HEIGHT / 5) * 2 )
        {
          ball.ballDirection = {x: -1, y: Math.random() * -2};
        }
        else if ( ball.ballPosition.y  >= player.player2Position.y + (PADDLE_HEIGHT / 5) * 2 && ball.ballPosition.y  < player.player2Position.y + PADDLE_HEIGHT - (PADDLE_HEIGHT / 5) )
        {
          ball.ballDirection = {x: -1, y: Math.random() * 2};
        }
        else if ( ball.ballPosition.y  >= player.player2Position.y + PADDLE_HEIGHT - (PADDLE_HEIGHT / 5) && ball.ballPosition.y  < player.player2Position.y + PADDLE_HEIGHT )
        {
          ball.ballDirection = {x: -1, y: Math.random() * 2.5};
        }
        else
        {
          ball.ballDirection = {x: -1, y: Math.random() * 0.5};
        }
        socket.to(roomId).emit("paddle2Audio");
      }
      else
      {
        ball.ballPosition = {x: ball.ballPosition.x + ball.ballDirection.x * ball.ballSpeed, y: ball.ballPosition.y + ball.ballDirection.y * ball.ballSpeed}
      }

      this.player.set(roomId, player);
      this.ball.set(roomId, ball);
      this.bonus.set(roomId, bonus);
      this.game.set(roomId, game);
    }
  }

	@SubscribeMessage('newInvit')
	newInvit(
		@MessageBody() data: { invit: CreateInvitationDto[]; user: string },
		@ConnectedSocket() client: Socket
	) {
		data.invit.map(async (invit: CreateInvitationDto) => {
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
			const createInvit = await this.invitationsService.createInvitation(
				invit.type,
				invit.channelId,
				invit.friendId,
				invit.invitedUsers,
				data.user
			);
			if (createInvit.id) {
				this.launchInvitGame(createInvit.id, client);
			}
		});
	}

	@SubscribeMessage('handleGameInvit')
	async handleGameInvit(
		@MessageBody() data: { friendId: number; accept: boolean },
		@ConnectedSocket() client: Socket
	) {
		if (data.accept) {
			const getGameInvitation =
				await this.invitationsService.getGameInvitation(
					data.friendId,
					client.data.accessToken.userId
				);
			if (getGameInvitation[0]) {
				this.launchInvitGame(getGameInvitation[0].id, client);
			}
		}

		try {
			const invitation = {
				type: invitMode.GAME,
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

	protected async launchInvitGame(
		invitId: number,
		client: Socket
	): Promise<void> {
		if (!this.invitMap.has(invitId)) {
			this.invitMap.set(invitId, client);
		} else {
			this.logger.debug(
				`Player ${client.id} joined the queue for invit Pong.`
			);

			const player1 = {
				id: this.invitMap.get(invitId).id,
				socket: this.invitMap.get(invitId),
			}; //sender
			const player2 = { id: client.id, socket: client }; //receiver
			const player1IdPrisma = player1.socket.data.accessToken.userId;
			const player2IdPrisma = player2.socket.data.accessToken.userId;
			if (player1IdPrisma === player2IdPrisma) {
				this.logger.debug(
					`Can't match players. ${player1.id} and ${player2.id} are the same user.`
				);
				this.queuePower.push(player1);
				return;
			}
			this.logger.debug(
				`Matching players ${player1.id} and ${player2.id}.`
			);

			const gameId = v4();
			const room = `room-${gameId}`;
			const playersRoom = [
				{ client: player1.socket, side: 'left' },
				{ client: player2.socket, side: 'right' },
			];
			this.rooms.set(room, playersRoom);

			const player1array = {
				client: player1.socket,
				side: 'left',
				room: room,
				mode: 'power',
			};
			const player2array = {
				client: player2.socket,
				side: 'right',
				room: room,
				mode: 'power',
			};

			this.players.push(player1array);
			this.players.push(player2array);

			player1.socket.join(room);
			player2.socket.join(room);
			player1.socket.to(room).emit('launchOnInvit', true); //a mettre dans le front
			player2.socket.to(room).emit('launchOnInvit', true);

			await this.waitForPageLoad(player1.socket, player2.socket);

			const gameIdPrisma = await this.gameService.createGame(
				player1IdPrisma,
				player2IdPrisma,
				gameMode.POWER
			);

			player1.socket.to(room).emit('room', { roomId: room });
			player2.socket.to(room).emit('room', { roomId: room });
			player1.socket.to(room).emit('side', { side: 'right' });
			player2.socket.to(room).emit('side', { side: 'left' });
			player1.socket.to(room).emit('power', { power: true });
			player2.socket.to(room).emit('power', { power: true });

			console.log(`New game started with id ${gameId}.`);

			this.player.set(room, this.getDefaultPlayerState());
			this.ball.set(room, this.getDefaultBallState());
			this.bonus.set(room, this.getDefaultBonusState());
			this.game.set(room, this.getDefaultGameState());
			this.gameIdPrisma.set(room, gameIdPrisma);
		}
	}

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
