import { Message } from '@prisma/client';
import { ChannelEntity } from 'src/channels/entities/channel.entity';
import { UserEntity } from 'src/users/entities/user.entity';

export class MessageEntity implements Message {
	id: number;
	createdAt: Date;
	content: string;
	creatorId: number;
	createdBy?: Partial<UserEntity>;
	channelId: number;
	channel?: Partial<ChannelEntity>;

	constructor({ createdBy, channel, ...data }: Partial<MessageEntity>) {
		Object.assign(this, data);
		// if (createdBy) {
		//   this.createdBy = new UserEntity(createdBy);
		// }
		if (channel) {
			this.channel = new ChannelEntity(channel);
		}
	}
}
