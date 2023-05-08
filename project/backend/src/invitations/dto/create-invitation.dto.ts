import { InvitationEntity } from '../entities/invitation.entity';
import { PickType } from '@nestjs/swagger';

export class CreateInvitationDto extends PickType(InvitationEntity, [
	'type',
	'friendId',
	'channelId',
	'username',
	'invitedUsers',
] as const) {}
