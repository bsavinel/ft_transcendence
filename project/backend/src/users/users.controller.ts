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
	UploadedFile,
	ParseFilePipeBuilder,
	HttpStatus,
	StreamableFile,
} from '@nestjs/common';
import { Express } from 'express';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { AccessGuard } from '../guards/access.guard';
import { RequestWithAccess } from '../type/token.type';
import { GameService, GameData } from 'src/game/game.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { join } from 'path';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
@UseGuards(AccessGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly gameService: GameService
	) {}

	@Post('upload')
	@UseInterceptors(
		FileInterceptor('avatar', {
			storage: diskStorage({
				destination: './uploads/',
			}),
			fileFilter: (req, file, cb) => {
				if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
					cb(null, true);
				} else {
					cb(new BadRequestException('Unsupported file type'), false);
				}
			},
			limits: { fileSize: 5000000 },
		})
	)
	UploadAvatar(
		@UploadedFile() avatar: Express.Multer.File,
		@Req() request: RequestWithAccess
	) {
		console.log(avatar);
		this.usersService.saveAvatarPath(
			request.accessToken.userId,
			avatar.path
		);
		return 'SUCCESS';
	}

	@Get('/avatar/:id')
	async getAvatars(
		@Param('id', ParseIntPipe) id: number
	): Promise<StreamableFile> {
		const localFileName: string = await this.usersService.getAvatarUrl(id);
		const file = createReadStream(join(process.cwd(), localFileName));
		return new StreamableFile(file);
	}

	//userById
	//TODO
	//add query blocked user
	@Get('/profile/:id')
	async findById(
		@Param('id', ParseIntPipe) id: number,
		@Query('friend') friend: string,
		@Query('channel') channel: string
	): Promise<UserEntity> {
		try {
			let userFriends: Partial<Partial<UserEntity>>;
			let userChannels: Partial<Partial<UserEntity>>;
			let userFind = await this.usersService.findById(id);
			if (friend === 'true') {
				userFriends = await this.usersService.findFriends(id);
			}
			if (channel === 'true') {
				userChannels = await this.usersService.findChannel(id);
			}
			userFind = {
				...userFind,
				...userFriends,
				...userChannels,
				win: (await this.gameService.getGameWinByUserId(id)).length,
				lose: (await this.gameService.getGameLoseByUserId(id)).length,
				winRank: await this.usersService.getClassementWin(id),
				levelRank: await this.usersService.getClassementLevel(id),
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
		@Query('blockedId', ParseIntPipe) blockedId: number
	): Promise<UserEntity> {
		try {
			const delBlockedUser = await this.usersService.deleteBlockedUser(
				request.accessToken.userId,
				blockedId
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
		@Query('asWin') asWin: string | undefined
	): Promise<GameData[]> {
		try {
			if (asWin === undefined) {
				return await this.gameService.getGameByUserId(id);
			} else if (asWin === 'true') {
				return await this.gameService.getGameWinByUserId(id);
			} else {
				return await this.gameService.getGameLoseByUserId(id);
			}
		} catch (error) {
			return [];
		}
	}

	@Get('/me')
	async me(@Req() req: RequestWithAccess): Promise<UserEntity> {
		return await this.usersService.findById(req.accessToken.userId);
	}

	@Get()
	async gatAll(): Promise<UserEntity[]> {
		let users = await this.usersService.getAllUsers();
		let tmp = users.map(async (user) => ({
			...user,
			win: (await this.gameService.getGameWinByUserId(user.id)).length,
			lose: (await this.gameService.getGameLoseByUserId(user.id)).length,
		}));
		users = await Promise.all(tmp);
		return users;
	}

	@Get('/nbuser')
	async getNbUsers(): Promise<number> {
		return await this.usersService.getNbUser();
	}
}
