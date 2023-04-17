import {
	BadRequestException,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Query,
	UseGuards,
} from '@nestjs/common';
import { GameData, GameService } from './game.service';
import { AccessGuard } from 'src/guards/access.guard';

@UseGuards(AccessGuard)
@Controller('games')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	//! ######################################################################
	//! ############################ GET METHODES ############################
	//! ######################################################################

	//* ############################## ALL GAMES ##############################

	@Get()
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

	@Get('/:id')
	async getGame(@Param('id', ParseIntPipe) id: number): Promise<GameData> {
		return await this.gameService.getGameById(id);
	}
}
