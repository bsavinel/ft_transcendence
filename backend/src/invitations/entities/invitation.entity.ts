import { Invitation, invitMode } from '@prisma/client';

export class InvitationEntity implements Invitation {
	id: number;
	type: invitMode;
	friendId: number;
	channelId: number;
	username: string;
	invitedUsers: number;

	constructor(invit: InvitationEntity) {
		Object.assign(this, invit);
	}
}
