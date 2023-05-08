import { InvitationEntity } from '../entities/invitation.entity';
import { PickType } from '@nestjs/swagger';

export class DeleteInvitationDto extends PickType(InvitationEntity, [
	'type',
	'friendId',
	'channelId',
	'invitedUsers',
] as const) {}
