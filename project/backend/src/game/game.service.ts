import { Injectable } from '@nestjs/common';
import { UserOnGame, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { gameMode } from '@prisma/client';

export interface GameData {
	id: number;
	winnerId: number;
	isFinish: boolean;
	createdAt: Date;
	players: { score: number; asWin: boolean; user: User; userId: number; }[];
}

@Injectable()
export class GameService {
	constructor(private readonly prisma: PrismaService) {}

	//! ########################################################################
	//! ########################### GAME CREATOR ###############################
	//! ######################### (last -> first) ##############################
	//! ########################################################################

	async createGame(
		idPlayer1: number,
		idPlayer2: number,
		mode: gameMode
	): Promise<number> {
		const newGame = await this.prisma.game.create({ data: { mode } });
		await this.prisma.userOnGame.create({
			data: { gameId: newGame.id, userId: idPlayer1 },
		});
		await this.prisma.userOnGame.create({
			data: { gameId: newGame.id, userId: idPlayer2 },
		});
		return newGame.id;
	}

	async findUserOnGame(idGame: number): Promise<UserOnGame[]> {
		return await this.prisma.userOnGame.findMany({
			where: { gameId: idGame },
		});
	}

	async FinishGame(
		idGame: number,
		player1: { id: number; score: number },
		player2: { id: number; score: number },
		winerId?: number
	): Promise<void> {
		const players = await this.findUserOnGame(idGame);

		if (players.length != 2) throw new Error('Game not found');
		else if (
			players[0].userId != player1.id &&
			players[1].userId != player1.id
		)
			throw new Error('Bad player1');
		else if (
			players[0].userId != player2.id &&
			players[1].userId != player2.id
		)
			throw new Error('Bad player2');
		await this.prisma.userOnGame.update({
			where: {
				id: players[0].id == player1.id ? players[1].id : players[0].id,
			},
			data: {
				score: player1.score,
				asWin: winerId
					? winerId === player1.id
					: player1.score > player2.score,
			},
		});
		await this.prisma.userOnGame.update({
			where: {
				id: players[0].id == player2.id ? players[0].id : players[1].id,
			},
			data: {
				score: player2.score,
				asWin: winerId
					? winerId === player2.id
					: player2.score > player1.score,
			},
		});
		await this.prisma.game.update({
			where: { id: idGame },
			data: {
				isFinish: true,
				winnerId: winerId
					? winerId
					: player1.score > player2.score
					? player1.id
					: player2.id,
			},
		});
		let user = await this.prisma.user.findMany({
			where: { id: { in: [player1.id, player2.id] } },
		});
		await this.prisma.user.update({
			where: { id: user[0].id },
			data: {
				level: this.getNewLevel(
					user[0].level,
					Math.abs(player1.score - player2.score),
					user[0].id === winerId
				),
			},
		});
		await this.prisma.user.update({
			where: { id: user[1].id },
			data: {
				level: this.getNewLevel(
					user[1].level,
					Math.abs(player1.score - player2.score),
					user[1].id === winerId
				),
			},
		});
	}

	getNewLevel(
		oldLevel: number,
		scoreDiference: number,
		asWin: boolean
	): number {
		if (asWin) {
			return oldLevel + scoreDiference * 0.1;
		} else {
			if (oldLevel - scoreDiference * 0.1 < Math.floor(oldLevel))
				return Math.floor(oldLevel);
			return oldLevel - scoreDiference * 0.1;
		}
	}

	//! ########################################################################
	//! ############################# GET GAME #################################
	//! ########################## (last -> first) #############################
	//! ########################################################################

	async getGameById(id: number): Promise<GameData> {
		return await this.prisma.game.findUnique({
			where: {
				id: id,
			},
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: {
					select: {
						userId: true,
						score: true,
						asWin: true,
						user: true,
					},
				},
			},
		});
	}

	async getGames(): Promise<GameData[]> {
		return await this.prisma.game.findMany({
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: {
					select: {
						userId: true,
						score: true,
						asWin: true,
						user: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async getGameByUserId(id: number): Promise<GameData[]> {
		let tab = await this.prisma.game.findMany({
			where: { players: { some: { userId: id } } },
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: {
					select: {
						userId: true,
						score: true,
						asWin: true,
						user: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		console.log(tab);
		console.log(tab[0].players)
		return tab;
	}

	async getGameWinByUserId(id: number): Promise<GameData[]> {
		let tab = await this.prisma.game.findMany({
			where: {
				players: { some: { userId: id, asWin: true } },
			},
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: {
					select: {
						userId: true,
						score: true,
						asWin: true,
						user: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return tab;
	}

	async getGameLoseByUserId(id: number): Promise<GameData[]> {
		let tab = await this.prisma.game.findMany({
			where: {
				players: { some: { userId: id, asWin: false } },
			},
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: {
					select: {
						userId: true,
						score: true,
						asWin: true,
						user: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return tab;
	}
}
