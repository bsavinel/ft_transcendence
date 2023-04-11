import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	ClassSerializerInterceptor,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelEntity } from './entities/channel.entity';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateChannelDto } from './dto/create-channel.dto';
import { AccessGuard } from 'src/guards/access.guard';

@Controller('channels')
// Used to group endpoints in swagger
@ApiTags('Channels')
// @UseGuards(AccessGuard)
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
		@Body() createChannelDto: CreateChannelDto
	): Promise<ChannelEntity> {
		//TODO: a remplacer par le truc du guard/access
		const userId = 1;
		return new ChannelEntity(
			await this.channelsService.create(createChannelDto, userId)
		);
	}

	@ApiOperation({ description: 'Returns one chan all infos' })
	@ApiParam({
		name: 'id',
		examples: {
			good: { summary: 'bon', value: '1' },
			bad: { summary: 'bad', value: 43 },
		},
	})
	@Get(':id')
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<ChannelEntity> {
		return new ChannelEntity(await this.channelsService.findOne(id));
	}

	@ApiOperation({
		description:
			'Update a specified channel. Can update either its name, its mode or both at the same time',
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
				summary: 'Public chan to Protected WITHOUT Password: should raise an error.',
				value: { mode: 'PROTECTED' },
			},
			protToPubWithPass: {
				summary: 'Protected to public/private with password (shouldnt let password in db).',
				value: { mode: 'PUBLIC', password: 'niehpasspouet' },
			},
			protToPub: {
				summary: 'Protected to public/private.',
				value: { mode: 'PUBLIC'},
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
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Param('me', ParseIntPipe) me: number,
		@Body() updateChannelDto: UpdateChannelDto
	): Promise<Partial<ChannelEntity>> {
		return new ChannelEntity(
			await this.channelsService.update(id, updateChannelDto, me)
		);
	}

	@ApiOperation({
		description:
			'Delete the specified chan. Upon success, returns the deleted chan.',
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
	@Delete(':id')
	async remove(
		@Param('id', ParseIntPipe) id: number
	): Promise<ChannelEntity> {
		return new ChannelEntity(await this.channelsService.remove(id));
	}
}

// @ApiOperation({ description: 'Return all channels' })
// @Get()
// async findAll(): Promise<ChannelEntity[]> {
// 	const chans = await this.channelsService.findAll();
// 	return chans.map((chan) => new ChannelEntity(chan));
// }

// @ApiOperation({ description: 'Return all PROTECTED channels' })
// @Get('protected')
// async findProtected(): Promise<ChannelEntity[]> {
// 	const chans = await this.channelsService.findProtected();
// 	return chans.map((chan) => new ChannelEntity(chan));
// }

// @ApiOperation({ description: 'Return all PUBLIC channels' })
// @Get('public')
// async findPublic(): Promise<ChannelEntity[]> {
// 	const chans = await this.channelsService.findPublic();
// 	return chans.map((chan) => new ChannelEntity(chan));
// }

// 	@ApiOperation({ description: 'Returns the chan mode, identified by "id"' })
// 	@Get('mode/:id')
// 	async getMode(@Param('id', ParseIntPipe) id: number): Promise<string> {
// 		return (await this.channelsService.getMode(id)).mode;
// 	}

// 	@ApiOperation({ description: 'Returns the chan name, identified by "id"' })
// 	@Get('name/:id')
// 	async getName(@Param('id', ParseIntPipe) id: number): Promise<string> {
// 		return (await this.channelsService.getName(id)).channelName;
// 	}
