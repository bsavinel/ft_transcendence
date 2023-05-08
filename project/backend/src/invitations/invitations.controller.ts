import {
	Controller,
	Get,
	Post,
	Body,
	BadRequestException,
	UseGuards,
	Req,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { invitMode } from '@prisma/client';
import { AccessGuard } from 'src/guards/access.guard';
import { RequestWithAccess } from 'src/type/token.type';

@Controller('invitations')
@UseGuards(AccessGuard)
export class InvitationsController {
	constructor(private readonly invitationsService: InvitationsService) {}

	@Post()
	createInvitation(
		@Body()
		data: {
			type: invitMode;
			channelId: number;
			friendId: number;
			userId: number;
			username: string;
		}
	) {
		return this.invitationsService.createInvitation(
			data.type,
			data.channelId,
			data.friendId,
			data.userId,
			data.username
		);
	}

	@Get()
	getInvitation(@Req() request: RequestWithAccess) {
		try {
			const invit = this.invitationsService.getInvitation(
				request.accessToken.userId
			);
			return invit;
		} catch (error) {
			throw new BadRequestException(error.name);
		}
	}
}
