import {
	Controller,
	Post,
	Body,
	UseInterceptors,
	ClassSerializerInterceptor,
	UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { AccessGuard } from 'src/guards/access.guard';
import { Roles } from 'src/channels/roles.decorator';
import { roleChannel } from '@prisma/client';
import { ChanRoleGuard } from 'src/channels/channels.roles.guard';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(AccessGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class MessagesController {
	constructor(private readonly messagesService: MessagesService) {}

	@ApiOperation({ description: 'Post a message' })
	@Roles(roleChannel.USER, roleChannel.CREATOR, roleChannel.ADMIN, null)
	@UseGuards(ChanRoleGuard)
	@Post()
	async create(@Body() createMessageDto: CreateMessageDto): Promise<string> {
		await this.messagesService.create(createMessageDto);
		return 'Message created';
	}
}
