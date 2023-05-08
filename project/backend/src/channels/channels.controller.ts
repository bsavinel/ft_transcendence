import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Req,
	UseInterceptors,
	ClassSerializerInterceptor,
	ParseIntPipe,
	UseGuards,
	Query,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelEntity } from './entities/channel.entity';
import {
	ApiTags,
	ApiOperation,
	ApiParam,
	ApiBody,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AccessGuard } from 'src/guards/access.guard';
import { RequestWithAccess } from '../type/token.type';
import { Roles } from './roles.decorator';
import { roleChannel, UserOnChannel } from '@prisma/client';
import { ChanRoleGuard } from './channels.roles.guard';

@Controller('channels')
// Used to group endpoints in swagger
@ApiTags('Channels')
@ApiBearerAuth('Transandance Token')
@UseGuards(AccessGuard)
// Used to apply the 'exclude password' to all endpoints (see https://docs.nestjs.com/techniques/serialization)
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelsController {
	constructor(private readonly channelsService: ChannelsService) {}

	@ApiBody({
		description:
			'The Description for the Post Body. Please look into the DTO. You will see the @ApiOptionalProperty used to define the Schema.',
		examples: {
			good: {
				summary: 'Basic Body',
				value: { mode: 'PRIVATE', channelName: 'string' },
			},
			empty: {
				summary: 'Empty Body',
				description: 'Empty',
				value: {},
			},
			withId: {
				summary: 'With Id',
				description: 'Check the id is not pris en compte.',
				value: { mode: 'PRIVATE', channelName: 'string', id: 1 },
			},
			PubWithPassword: {
				summary: 'Pub With Password',
				description: 'Check the Password is not pris en compte.',
				value: {
					mode: 'PUBLIC',
					channelName: 'PubWithPass',
					password: 'JeSuisUnPassword',
				},
			},
			PrivWithPassword: {
				summary: 'Priv With Password',
				description: 'Check the Password is not pris en compte.',
				value: {
					mode: 'PRIVATE',
					channelName: 'PrivWithPass',
					password: 'JeSuisUnPassword',
				},
			},
			ProtWithPassword: {
				summary: 'Prot With Password',
				description: 'Check the Password is pris en compte.',
				value: {
					mode: 'PROTECTED',
					channelName: 'ProtWithPass',
					password: 'JeSuisUnPassword',
				},
			},
			ProtWithNoPassword: {
				summary: 'Prot With NO Password',
				description: 'Should raise an error.',
				value: {
					mode: 'PROTECTED',
					channelName: 'ProtWithNoPass',
				},
			},
			PubWithNOPassword: {
				summary: 'Pub With no Password',
				description: 'Check the Password is not pris en compte.',
				value: {
					mode: 'PUBLIC',
					channelName: 'PubWithPass',
				},
			},
			withWrongType: {
				summary: 'With WrongType',
				description: 'Wrong attribute pass',
				value: {
					mode: 'PUBLIC',
					channelName: 'string',
					nieh: 'llalalala',
				},
			},
			withEmptyDefinedName: {
				summary: 'With EmptyDefinedName',
				description: 'Attribute channelName defined but only ws',
				value: { mode: 'PUBLIC', channelName: '                   ' },
			},
			withTrimableName: {
				summary: 'With TrimableName',
				description:
					'Attribute channelName with spaces between words (check to see if those spaces are not trimmed)',
				value: {
					mode: 'PUBLIC',
					channelName: '    lalala je veux etre TRIM               ',
				},
			},
		},
	})
	@ApiOperation({
		description:
			' Create a new Channel AND a new UserOnChannel (with the current user who made the request as the userId and the newly created chan as chanId). Upon success returns the new chan infos.',
	})
	@Post()
	async create(
		@Req() rqst: RequestWithAccess,
		@Body() createChannelDto: CreateChannelDto
	): Promise<ChannelEntity> {
		const me = rqst.accessToken.userId;
		return new ChannelEntity(
			await this.channelsService.create(createChannelDto, me)
		);
	}

	@ApiOperation({
		description:
			'Ban a user from a specified chan. Only available to creator and admins. A creator cant be banned.',
	})
	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@Post(':chanId/ban/:userId')
	async ban(
		@Param('chanId', ParseIntPipe) chanId: number,
		@Param('userId', ParseIntPipe) userId: number
	): Promise<string> {
		return await this.channelsService.banUserOnChan(userId, chanId);
	}

	@ApiOperation({
		description:
			'Join a channel (create a new useronChannel record). Only permitted to non BANNED users.',
	})
	@Roles(roleChannel.USER, roleChannel.CREATOR, roleChannel.ADMIN, null)
	@UseGuards(ChanRoleGuard)
	@Post('join/:chanId')
	async joinChan(
		@Param('chanId', ParseIntPipe) chanId: number,
		@Req() rqst: RequestWithAccess,
		@Body('password') password?: string
	): Promise<ChannelEntity> {
		const me = rqst.accessToken.userId;
		return new ChannelEntity(
			await this.channelsService.joinChan(me, chanId, password)
		);
	}

	@ApiOperation({
		description: 'Sets a user as admin for a channel.',
	})
	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@Patch(':chanId/giverights/:userId')
	async setUserAsAdmin(
		@Param('chanId', ParseIntPipe) chanId: number,
		@Param('userId', ParseIntPipe) userId: number
	): Promise<string> {
		return await this.channelsService.changeRights(
			userId,
			chanId,
			roleChannel.ADMIN
		);
	}

	@ApiOperation({
		description: 'Removes a user admin rights on a given channel.',
	})
	@Roles(roleChannel.CREATOR, roleChannel.ADMIN)
	@UseGuards(ChanRoleGuard)
	@Patch(':chanId/removerights/:userId')
	async removeAdminRights(
		@Param('chanId', ParseIntPipe) chanId: number,
		@Param('userId', ParseIntPipe) userId: number
	): Promise<string> {
		return await this.channelsService.changeRights(
			userId,
			chanId,
			roleChannel.USER
		);
	}

	@ApiOperation({
		description: 'Return all messages from the {chanId} channel (a )',
	})
	@Roles(roleChannel.USER, roleChannel.CREATOR, roleChannel.ADMIN, null)
	@UseGuards(ChanRoleGuard)
	@Get('/messages/:chanId')
	async getMessages(
		@Req() rqst: RequestWithAccess,
		@Param('chanId', ParseIntPipe) chanId: number
	) {
		return await this.channelsService.getMessages(
			rqst.accessToken.userId,
			chanId
		);
	}

	@ApiOperation({
		description:
			'Returns a list of UserOnChannel for specified chan. Usefull to see who is owner/admin etc',
	})
	@Get('users/:chanId')
	async getAdminsFromChan(
		@Param('chanId', ParseIntPipe) chanId: number
	): Promise<UserOnChannel[]> {
		return await this.channelsService.getUserOnChannel(chanId);
	}

	@ApiOperation({
		description: 'Returns a channel by its id.',
	})
	@Roles('CREATOR', 'ADMIN', 'USER')
	@UseGuards(ChanRoleGuard)
	@Get('/byid/:chanId')
	async getChannels(
		@Param('chanId', ParseIntPipe) id: number,
		@Req() rqst: RequestWithAccess
	): Promise<ChannelEntity> {
		return new ChannelEntity(await this.channelsService.getChannelById(id));
	}

	@ApiOperation({
		description: 'Returns a list of the user`s suscribed channels.',
	})
	@Get()
	async suscribedChannels(@Req() rqst: RequestWithAccess) {
		const me = rqst.accessToken.userId;
		const chansList = await this.channelsService.suscribedChannels(me);
		return chansList.map((chan) => new ChannelEntity(chan));
	}

	@ApiOperation({
		description:
			'Update a specified channel: change its password and/or mode. Only CREATOR can do it.',
	})
	@ApiBody({
		description:
			'The Description for the Post Body. Please look into the DTO. You will see the @ApiOptionalProperty used to define the Schema.',
		examples: {
			onlyName: {
				summary: 'Only name update',
				value: { channelName: 'HIHIHIHI' },
			},
			onlyPasswd: {
				summary: 'Only passwd update',
				value: { password: 'niiiiieh' },
			},
			pubToProtWithPass: {
				summary: 'Public chan to Protected with Password',
				value: { mode: 'PROTECTED', password: 'niiiiieh' },
			},
			pubToProtNOPass: {
				summary:
					'Public chan to Protected WITHOUT Password: should raise an error.',
				value: { mode: 'PROTECTED' },
			},
			protToPubWithPass: {
				summary:
					'Protected to public/private with password (shouldnt let password in db).',
				value: { mode: 'PUBLIC', password: 'niehpasspouet' },
			},
			protToPub: {
				summary: 'Protected to public/private.',
				value: { mode: 'PUBLIC' },
			},
			empty: {
				summary: 'Empty test',
				value: {},
			},
			wrongType: {
				summary: 'wrongType test',
				value: { lala: 'adfs', suisworngtye: 'fdsfsd', hashdf: '' },
			},
		},
	})
	@Patch(':chanId')
	@Roles(roleChannel.CREATOR)
	@UseGuards(ChanRoleGuard)
	async update(
		@Param('chanId', ParseIntPipe) chanId: number,
		@Body() updateChannelDto: UpdateChannelDto
	): Promise<Partial<ChannelEntity>> {
		return new ChannelEntity(
			await this.channelsService.update(chanId, updateChannelDto)
		);
	}

	@ApiOperation({
		description:
			'Delete the specified chan. Upon success, returns the deleted chan. Only CREATOR can do it.',
	})
	@ApiParam({
		name: 'id',
		examples: {
			good: { summary: 'good', value: '1' },
			bad: { summary: 'bad', value: 43 },
			empty: { summary: 'empty', value: '' },
			neg: { summary: 'negative', value: '-12' },
			string: { summary: 'string', value: 'hahdf' },
		},
	})
	@Delete('leave/:chanId')
	@UseGuards(ChanRoleGuard)
	async leaveChannel(
		@Req() rqst: RequestWithAccess,
		@Param('chanId', ParseIntPipe) chanId: number
	): Promise<string> {
		return await this.channelsService.leaveChan(
			rqst.accessToken.userId,
			chanId
		);
	}

	@Delete(':chanId')
	@Roles(roleChannel.CREATOR)
	@UseGuards(ChanRoleGuard)
	async remove(
		@Param('chanId', ParseIntPipe) chanId: number
	): Promise<ChannelEntity> {
		return new ChannelEntity(await this.channelsService.remove(chanId));
	}

	@Get('publicChannel?')
	async getPublicChannel(@Query('offset') offset: string) {
		return await this.channelsService.getPublicChannel(+offset);
	}

	@Get('/protectedChannel?')
	async getProtectedChannel(@Query('offset') offset: string) {
		return await this.channelsService.getProtectedChannel(+offset);
	}

	@Get('/nonPrivateChannel?')
	async getNonPrivateChannel(
		@Query('skip') skip: string,
		@Query('take') take: string,
		@Req() rqst: RequestWithAccess
	): Promise<ChannelEntity[]> {
		const chan = await this.channelsService.getNonPrivateChannel(
			+take,
			+skip,
			rqst.accessToken.userId
		);
		return chan.map((chan) => new ChannelEntity(chan));
	}
}
