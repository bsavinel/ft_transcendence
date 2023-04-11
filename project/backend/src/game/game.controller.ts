import {
	BadRequestException,
	Controller,
	Get,
	Param,
	ParseBoolPipe,
	ParseIntPipe,
	Query,
	UseGuards,
} from '@nestjs/common';
import { GameData, GameService } from './game.service';
import { AccessGuard } from 'src/guards/access.guard';
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
	ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Games')
@ApiBearerAuth('Transandance Token')
@UseGuards(AccessGuard)
@Controller('Games')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	//! ######################################################################
	//! ############################ GET METHODES ############################
	//! ######################################################################

	//* ############################## ALL GAMES ##############################

	@Get()
	@ApiOperation({ summary: 'Get all games' })
	@ApiQuery({
		name: 'limit',
		description: 'Limit of games to get (default and maximum 50)',
		allowEmptyValue: true,
		examples: {
			a: { summary: 'Get 37 games', value: '37' },
		},
	})
	@ApiQuery({
		name: 'idFirst',
		description: 'Id to start the next get',
		allowEmptyValue: true,
		examples: {
			a: { summary: 'Start after game with id 27', value: '27' },
		},
	})
	@ApiOkResponse({
		description:
			'Return an array containing limit games, from idFirst from the youngest game to the oldest game',
		schema: {
			type: 'array',
			items: {
				type: 'object',
				required: [
					'id',
					'winnerId',
					'isFinish',
					'createdAt',
					'players',
				],
				properties: {
					id: { type: 'number' },
					winnerId: { type: 'number' },
					isFinish: { type: 'boolean' },
					createdAt: { type: 'string', format: 'date-time' },
					players: {
						type: 'array',
						items: {
							type: 'object',
							required: [
								'id',
								'gameId',
								'userId',
								'asWin',
								'score',
							],
							properties: {
								id: { type: 'number' },
								gameId: { type: 'number' },
								userId: { type: 'number' },
								asWin: { type: 'boolean' },
								score: { type: 'number' },
							},
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			"400 is returned when : <br/>- Additional query params are passed <br/>- Argument could not be parsed as number <br/>- 'idFirst' or 'limit' is negative",
	})
	getAllGames(
		@Query('limit', ParseIntPipe) limit: number,
		@Query('idFirst', ParseIntPipe) idFirst: number
	): Promise<GameData[]> {
		if (idFirst && idFirst < 0)
			throw new BadRequestException('idFirst must be positive');
		if (limit && limit < 0)
			throw new BadRequestException('limit must be positive');
		return this.gameService.getGames(limit, idFirst);
	}

	//* ############################## ONE GAME ###############################

	@ApiOperation({ summary: 'Get game with id' })
	@ApiParam({
		name: 'id',
		description: 'Id of the game to get',
		allowEmptyValue: false,
		examples: {
			a: { summary: 'Game with id 1', value: '1' },
			b: { summary: 'Game with id 27', value: '27' },
		},
	})
	@ApiOkResponse({
		description: 'Return the game with the id passed in parameter',
		schema: {
			type: 'object',
			required: ['id', 'winnerId', 'isFinish', 'createdAt', 'players'],
			properties: {
				id: { type: 'number' },
				winnerId: { type: 'number' },
				isFinish: { type: 'boolean' },
				createdAt: { type: 'string', format: 'date-time' },
				players: {
					type: 'array',
					items: {
						type: 'object',
						required: ['id', 'gameId', 'userId', 'asWin', 'score'],
						properties: {
							id: { type: 'number' },
							gameId: { type: 'number' },
							userId: { type: 'number' },
							asWin: { type: 'boolean' },
							score: { type: 'number' },
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'400 is returned when : - Argument could not be parsed as number <br/>',
	})
	@Get('/:id')
	async getGame(@Param('id', ParseIntPipe) id: number): Promise<GameData> {
		return await this.gameService.getGameById(id);
	}
}
