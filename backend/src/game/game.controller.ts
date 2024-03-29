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
	getAllGames(): Promise<GameData[]> {
		return this.gameService.getGames();
	}

	//* ############################## ONE GAME ###############################

	@Get('/:id')
	async getGame(@Param('id', ParseIntPipe) id: number): Promise<GameData> {
		return await this.gameService.getGameById(id);
	}
}
