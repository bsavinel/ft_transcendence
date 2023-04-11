import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	ParseIntPipe,
	UseInterceptors,
	ClassSerializerInterceptor,
	UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { MessageEntity } from './entities/message.entity';
import { AccessGuard } from 'src/guards/access.guard';

@ApiTags('Messages')
@Controller('messages')
// @UseGuards(AccessGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class MessagesController {
	constructor(private readonly messagesService: MessagesService) {}

	//TODO: brancher le websocket!!
	@ApiOperation({ description: 'Post a message' })
	@Post()
	async create(@Body() createMessageDto: CreateMessageDto): Promise<string> {
		await this.messagesService.create(createMessageDto);
		return 'Message created';
	}

	@ApiOperation({ description: 'Returns one channel all messages.' })
	@ApiOkResponse({
		schema: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					content: { type: 'string' },
					createdAt: { type: 'string' },
					channelId: { type: 'number' },
				},
			},
		},
	})
	@Get('fromuser/:userId')
	async findAllByUser(
		@Param('userId', ParseIntPipe) userId: number
	): Promise<Partial<MessageEntity>[]> {
		return await this.messagesService.findAllByUser(userId);
	}

	@ApiOperation({
		description: 'Returns all messages from a user in a specific channel.',
	})
	@ApiOkResponse({
		schema: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					content: { type: 'string' },
					createdAt: { type: 'string' },
				},
			},
		},
	})
	@Get('fromuser/:userId/inchan/:chanId')
	async findAllByUserInChan(
		@Param('userId', ParseIntPipe) userId: number,
		@Param('chanId', ParseIntPipe) chanId: number
	): Promise<Partial<MessageEntity>[]> {
		return await this.messagesService.findAllByUserInChan(userId, chanId);
	}

	@ApiOperation({ description: 'Returns all messages from a channel.' })
	@ApiOkResponse({
		description: 'Array of messages.',
		schema: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					content: { type: 'string' },
					createdAt: { type: 'string', format: 'date-time' },
					createdBy: {
						type: 'object',
						properties: { username: { type: 'string' } },
					},
				},
			},
		},
	})
	@Get('fromchan/:chanId')
	async findAllByChannel(
		@Param('chanId', ParseIntPipe) chanId: number
	): Promise<Partial<MessageEntity>[]> {
		return await this.messagesService.findAllByChannel(chanId);
	}
}
