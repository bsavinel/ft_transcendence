import { Injectable } from '@nestjs/common';
import { UserOnGame } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

export interface GameData {
	id: number;
	winnerId: number;
	isFinish: boolean;
	createdAt: Date;
	players: UserOnGame[];
}

@Injectable()
export class GameService {
	constructor(private readonly prisma: PrismaService) {}

	//! ########################################################################
	//! ########################### GAME CREATOR ###############################
	//! ######################### (last -> first) ##############################
	//! ########################################################################

	async createGame(idPlayer1: number, idPlayer2: number): Promise<void> {
		const newGame = await this.prisma.game.create({ data: {} });
		await this.prisma.userOnGame.create({
			data: { gameId: newGame.id, userId: idPlayer1 },
		});
		await this.prisma.userOnGame.create({
			data: { gameId: newGame.id, userId: idPlayer2 },
		});
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
				id: players[0].id == player1.id ? players[0].id : players[1].id,
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
			data: { isFinish: true },
		});
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
				players: true,
			},
		});
	}

	async getGames(limit?: number, idFirst?: number): Promise<GameData[]> {
		if (!limit || limit > 50) limit = 50;
		if (idFirst < 0) idFirst = undefined;
		return await this.prisma.game.findMany({
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit + 1,
			cursor: idFirst ? { id: idFirst } : undefined,
		});
	}

	async getGameByUserId(
		id: number,
		limit?: number,
		idFirst?: number
	): Promise<GameData[]> {
		if (!limit || limit > 50) limit = 50;
		let tab = await this.prisma.game.findMany({
			where: { players: { some: { userId: id } } },
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit + 1,
			cursor: idFirst ? { id: idFirst } : undefined,
		});
		tab.shift();
		return tab;
	}

	async getGameWinByUserId(
		id: number,
		limit?: number,
		idFirst?: number
	): Promise<GameData[]> {
		if (!limit || limit > 50) limit = 50;
		let tab = await this.prisma.game.findMany({
			where: {
				players: { some: { userId: id, asWin: true } },
			},
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit + 1,
			cursor: idFirst ? { id: idFirst } : undefined,
		});
		tab.shift();
		return tab;
	}

	async getGameLoseByUserId(
		id: number,
		limit?: number,
		idFirst?: number
	): Promise<GameData[]> {
		if (!limit || limit > 50) limit = 50;
		let tab = await this.prisma.game.findMany({
			where: {
				players: { some: { userId: id, asWin: false } },
			},
			select: {
				id: true,
				createdAt: true,
				winnerId: true,
				isFinish: true,
				players: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit + 1,
			cursor: idFirst ? { id: idFirst } : undefined,
		});
		tab.shift();
		return tab;
	}
}