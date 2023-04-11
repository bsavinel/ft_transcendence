import { User, UserOnChannel } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements Partial<User> {
	id: number;
	username: string;
	avatarUrl: string;
	updatedAt: Date;
	friends?: Partial<UserEntity>[];
	channelsProfiles?: Partial<UserOnChannel>[];
	// messageUser: Message[];
	// gamePlay: UserOnGame[];

	@Exclude()
	createdAt: Date;

	@Exclude()
	id42: number;

	// @Exclude()
	// friends?: object;

	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial);
	}
}
