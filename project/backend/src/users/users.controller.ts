import {
	Controller,
	Get,
	Post,
	Param,
	ParseBoolPipe,
	ParseIntPipe,
	Delete,
	UseInterceptors,
	ClassSerializerInterceptor,
	BadRequestException,
	UseGuards,
	Query,
	Req,
	Body,
	Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { AccessGuard } from '../guards/access.guard';
import { RequestWithAccess } from '../type/token.type';
import { GameService, GameData } from 'src/game/game.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
@UseGuards(AccessGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly gameService: GameService
	) {}
	
	//userById
	//TODO
	//add query blocked user
	@Get(':id')
	async findById(
		@Param('id') id: string,
		@Query('friend') friend: string,
		@Query('channel') channel: string
	): Promise<UserEntity> {
		try {
			let userFriends: Partial<Partial<UserEntity>>;
			let userChannels: Partial<Partial<UserEntity>>;
			let userFind = await this.usersService.findById(+id);
			if (friend === 'true') {
				userFriends = await this.usersService.findFriends(+id);
			}
			if (channel === 'true') {
				userChannels = await this.usersService.findChannel(+id);
			}
			userFind = {
				...userFind,
				...userFriends,
				...userChannels,
			};
			return new UserEntity(userFind);
		} catch (error) {
			throw new BadRequestException(error.name);
		}
	}

	//allFriends
	@Get(':id/friends')
	async allFriends(@Param('id') id: string) {
		const userFriends = await this.usersService.findFriends(+id);
		console.log(userFriends);
		return userFriends;
	}

	//addFriend
	//TODO
	//return true
	@Post('/addFriend')
	async addFriend(
		@Req() request: RequestWithAccess,
		@Body() data: { friendId: number }
	): Promise<UserEntity> {
		try {
			const friend = await this.usersService.addFriend(
				request.accessToken.userId,
				data.friendId
			);
			return new UserEntity(friend);
		} catch (error) {
			console.log(error);
			throw new BadRequestException(error.name);
		}
	}

	//addBlockedUser
	@Post('/addBlockedUser')
	async addBlockedUser(
		@Req() request: RequestWithAccess,
		@Body() data: { blockedId: number }
	): Promise<UserEntity> {
		try {
			const newBlockedUser = await this.usersService.addBlockedUser(
				request.accessToken.userId,
				data.blockedId
			);
			return new UserEntity(newBlockedUser);
		} catch (error) {
			throw new BadRequestException(error.name);
		}
	}

	//TODO
	//impossible de throw une error si la relation est deja close ?
	//deleteFriend
	@Delete('/deleteFriend/:id')
	async deleteFriend(
		@Param('id') id: string,
		@Query('friendId') friendId: string
	): Promise<UserEntity> {
		try {
			const deleteFriend = await this.usersService.deleteFriend(
				+id,
				+friendId
			);
			return new UserEntity(deleteFriend);
		} catch (error) {
			throw new BadRequestException(error.name);
		}
	}

	//deleteBlockedUser
	@Delete('/deleteBlockedUser?')
	async deleteBlockedUser(
		@Req() request: RequestWithAccess,
		@Query('blockedId') blockedId: string
	): Promise<UserEntity> {
		try {
			const delBlockedUser = await this.usersService.deleteBlockedUser(
				request.accessToken.userId,
				+blockedId
			);
			return new UserEntity(delBlockedUser);
		} catch (error) {
			throw new BadRequestException(error.name);
		}
	}

	@Patch('/updateUserName')
	async updateUserName(
		@Req() request: RequestWithAccess,
		@Body() data: { username: string }
	): Promise<UserEntity> {
		try {
			const newUserName = this.usersService.updateUserName(
				request.accessToken.userId,
				data.username
			);
			return newUserName;
		} catch (error) {
			throw new BadRequestException(error.name);
		}
	}

	//* ############################ GAMES OF USER ############################

	@Get('/:id/games')
	async getGameOfUser(
		@Param('id', ParseIntPipe) id: number,
		@Query('limit', ParseIntPipe) limit: number,
		@Query('idFirst', ParseIntPipe) idFirst: number,
		@Query('asWin', ParseBoolPipe) asWin: boolean
	): Promise<GameData[]> {
		if (asWin === undefined) {
			return await this.gameService.getGameByUserId(id, limit, idFirst);
		} else if (asWin === true) {
			return await this.gameService.getGameWinByUserId(
				id,
				limit,
				idFirst
			);
		} else {
			return await this.gameService.getGameLoseByUserId(
				id,
				limit,
				idFirst
			);
		}
	}

	@Get('/me')
	me(@Req() req: RequestWithAccess): { id: number } {
		return { id: req.accessToken.userId };
	}
}
