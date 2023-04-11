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
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { AccessGuard } from '../guards/access.guard';
import { RequestWithAccess } from '../type/token.type';
import { GameService, GameData } from 'src/game/game.service';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
@UseGuards(AccessGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly gameService: GameService
	) {}

	@ApiOperation({
		description: 'Return all properties for one user OR throw an error',
	})
	@ApiParam({
		name: 'id',
		description: 'Id of the user we want to find in the database.',
		allowEmptyValue: false,
		examples: {
			a: { summary: 'User id is 1', value: '1' },
			b: { summary: 'User id is 42', value: '42' },
		},
	})
	@ApiQuery({
		name: 'friend',
		description: 'Get the user friend ?',
		allowEmptyValue: true,
		examples: {
			a: { summary: '?friend=true', value: 'true' },
			b: { summary: '?friend=false', value: 'false' },
		},
	})
	@ApiQuery({
		name: 'channel',
		description: 'Get the user channel ?',
		allowEmptyValue: true,
		examples: {
			a: { summary: '?channel=true', value: 'true' },
			b: { summary: '?channel=false', value: 'false' },
		},
	})
	@ApiOkResponse({
		description:
			'Return an object containing the user info + ?{friend/channel}',
		schema: {
			type: 'object',
			required: ['id', 'username', 'AvatarUrl'],
			properties: {
				id: { type: 'number' },
				username: { type: 'string' },
				avatarUrl: { type: 'string' },
				friends: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'number' },
							username: { type: 'string' },
							avatarUrl: { type: 'string' },
						},
					},
				},
				channelsProfiles: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							channelId: { type: 'number' },
							role: { type: 'string' },
							channel: {
								type: 'object',
								items: {
									type: 'object',
									properties: {
										channelName: { type: 'string' },
									},
								},
							},
						},
					},
				},
			},
		},
	})
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

	@ApiOperation({
		description: 'Return an array of friends',
	})
	@ApiParam({
		name: 'id',
		description:
			'Id of the user for whom we want to get the list of his friend users.',
		allowEmptyValue: false,
		examples: {
			a: { summary: 'User id is 1', value: '1' },
			b: { summary: 'User id is 42', value: '42' },
		},
	})
	@ApiOkResponse({
		description: 'A FAIRE',
		schema: {
			type: 'object',
			required: ['id', 'username', 'AvatarUrl'],
			properties: {
				id: {
					type: 'number',
				},
				username: {
					type: 'string',
				},
				AvatarUrl: {
					type: 'string',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'This description is for a 400 response. It is returned when additional query params are passed, or when the <b>useExclamation</b>-Argument could not be parsed as a boolean.',
	})
	@ApiResponse({
		status: 417,
		description:
			'One can also provided a Status-Code directly, as seen here',
	})
	//allFriends
	@Get(':id/friends')
	async allFriends(@Param('id') id: string) {
		const userFriends = await this.usersService.findFriends(+id);
		console.log(userFriends);
		return userFriends;
	}

	@ApiOperation({
		description: 'Return an array of channel',
	})
	@ApiParam({
		name: 'id',
		description:
			'Id of the user for whom we want to get the list of his channel',
		allowEmptyValue: false,
		examples: {
			a: { summary: 'User id is 1', value: '1' },
			b: { summary: 'User id is 42', value: '42' },
		},
	})
	@ApiOkResponse({
		description: 'A FAIRE',
		schema: {
			type: 'object',
			required: ['id', 'username', 'AvatarUrl'],
			properties: {
				id: {
					type: 'number',
				},
				username: {
					type: 'string',
				},
				AvatarUrl: {
					type: 'string',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'This description is for a 400 response. It is returned when additional query params are passed, or when the <b>useExclamation</b>-Argument could not be parsed as a boolean.',
	})
	@ApiResponse({
		status: 417,
		description:
			'One can also provided a Status-Code directly, as seen here',
	})
	//allUserChannel
	@Get(':id/channel')
	async allUserChannel(@Param('id') id: string) {
		const userChannel = await this.usersService.findChannel(+id);
		return userChannel;
	}

	@ApiOperation({
		description: 'Add new friend',
	})
	@ApiBody({
		description: '',
		examples: {
			a: {
				summary: 'Invalid Body',
				description: '{ friendId: id } required. (id: number)',
				value: {},
			},
			b: {
				summary: 'Valid Body',
				value: { friendId: 1 },
			},
		},
	})
	@ApiOkResponse({
		description: 'A FAIRE',
		schema: {
			type: 'object',
			required: ['id', 'username', 'AvatarUrl'],
			properties: {
				id: {
					type: 'number',
				},
				username: {
					type: 'string',
				},
				AvatarUrl: {
					type: 'string',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'This description is for a 400 response. It is returned when additional query params are passed, or when the <b>useExclamation</b>-Argument could not be parsed as a boolean.',
	})
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

	@ApiOperation({
		description: 'Add new blocked user',
	})
	@ApiBody({
		description: '',
		examples: {
			a: {
				summary: 'Invalid Body',
				value: {},
			},
			b: {
				summary: 'Valid Body',
				value: { blockedId: 1 },
			},
		},
	})
	@ApiOkResponse({
		description: 'A FAIRE',
		schema: {
			type: 'object',
			required: ['id', 'username', 'AvatarUrl'],
			properties: {
				id: {
					type: 'number',
				},
				username: {
					type: 'string',
				},
				AvatarUrl: {
					type: 'string',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'This description is for a 400 response. It is returned when additional query params are passed, or when the <b>useExclamation</b>-Argument could not be parsed as a boolean.',
	})
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

	@ApiOperation({
		description: 'Delete one friend',
	})
	@ApiParam({
		name: 'id',
		description: 'Id of the user for whom we want to delete a friend',
		allowEmptyValue: false,
		examples: {
			a: { summary: 'User id is 1', value: '1' },
			b: { summary: 'User id is 42', value: '42' },
		},
	})
	@ApiQuery({
		name: 'friendId',
		description: 'Id of this friend',
		allowEmptyValue: false,
		examples: {
			a: { summary: 'Friend id is 2', value: '2' },
			b: { summary: 'Friend id is 42', value: '42' },
		},
	})
	@ApiOkResponse({
		description: 'SUCCESS response',
		schema: {
			type: 'object',
			required: ['id', 'username', 'AvatarUrl'],
			properties: {
				id: { type: 'number' },
				updatedAt: { type: 'string' },
				username: { type: 'string' },
				AvatarUrl: { type: 'string' },
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'This description is for a 400 response. It is returned when additional query params are passed, or when the <b>useExclamation</b>-Argument could not be parsed as a boolean.',
	})
	//TODO
	//impossible de throw une error si la relation est deja close ?
	//deleteFriend
	@Delete('/deleteFriend?')
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

	@ApiOperation({
		description: 'Delete one blocked user',
	})
	@ApiParam({
		name: 'id',
		description:
			'Id of the user for whom we want to get the list of his friend users.',
		allowEmptyValue: false,
		examples: {
			a: { summary: 'User id is 1', value: '1' },
			b: { summary: 'User id is 42', value: '42' },
		},
	})
	@ApiOkResponse({
		description: 'A FAIRE',
		schema: {
			type: 'object',
			required: ['id', 'username', 'AvatarUrl'],
			properties: {
				id: {
					type: 'number',
				},
				username: {
					type: 'string',
				},
				AvatarUrl: {
					type: 'string',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description:
			'This description is for a 400 response. It is returned when additional query params are passed, or when the <b>useExclamation</b>-Argument could not be parsed as a boolean.',
	})
	//deleteBlockedUser
	@Delete('/deleteBlockedUser?')
	async deleteBlockedUser(
		@Req() request: RequestWithAccess,
		@Query('friendId') friendId: string
	): Promise<UserEntity> {
		try {
			const delBlockedUser = await this.usersService.deleteBlockedUser(
				request.accessToken.userId,
				+friendId
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

	@ApiOperation({ summary: 'Get games of user with is id' })
	@ApiParam({
		name: 'id',
		description: 'Id of the player',
		allowEmptyValue: false,
		examples: {
			a: { summary: 'Palyer with id 1', value: '1' },
			b: { summary: 'Player with id 27', value: '27' },
		},
	})
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
	@ApiQuery({
		name: 'asWin',
		description: 'Only get games where the user win or lose',
		allowEmptyValue: true,
		examples: {
			a: { summary: 'Game win', value: 'true' },
			b: { summary: 'Game Lose', value: 'false' },
		},
	})
	@ApiOkResponse({
		description:
			'Return an array containing {limit} games of one player, from idFirst from the youngest game to the oldest game',
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
			"400 is returned when : <br/>- Additional query params are passed <br/>- Argument could not be parsed as number <br/>- 'idFirst' or 'limit' is negative <br/>- 'asWin' is not 'true' or 'false'",
	})
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
}
