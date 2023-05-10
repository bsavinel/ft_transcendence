import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserEntity } from './entities/user.entity';
import { count } from 'console';

type UserCreation = {
	id42: number;
	username: string;
	avatarUrl: string;
};

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async saveAvatarPath(userId: number, path: string) {
		return await this.prisma.user.update({
			where: { id: userId },
			data: { avatarUrl: path },
		});
	}

	async getFriendsOf(userId: number): Promise<User[]> {
		return (
			await this.prisma.user.findUniqueOrThrow({
				where: { id: userId },
				select: { friendsOf: true },
			})
		).friendsOf;
	}

	async getAvatarUrl(userId: number): Promise<string> {
		return (
			await this.prisma.user.findUniqueOrThrow({
				where: { id: userId },
				select: { avatarUrl: true },
			})
		).avatarUrl;
	}

	async user42Exist(id42: number): Promise<boolean> {
		return !!(await this.prisma.user.findUnique({ where: { id42 } }));
	}

	async findUserWith42(id42: number): Promise<UserEntity> {
		return await this.prisma.user.findUnique({ where: { id42 } });
	}

	async createUser(newUser: UserCreation): Promise<void> {
		await this.prisma.user.create({ data: newUser });
	}

	async addFriend(userId: number, friendId: number): Promise<UserEntity> {
		if (userId === friendId) {
			throw new Error();
		}
		const friend = await this.prisma.user.update({
			where: { id: userId },
			data: {
				friends: {
					connect: { id: friendId },
				},
			},
		});
		return friend;
	}

	async deleteFriend(userId: number, friendId: number): Promise<UserEntity> {
		if (userId === friendId) {
			throw new Error();
		}
		const deleteFriend = this.prisma.user.update({
			where: { id: userId },
			data: {
				friends: {
					disconnect: { id: friendId },
				},
			},
		});
		return deleteFriend;
	}

	async getBlockedBy(blockedUser: number): Promise<User[]> {
		const blockedBy: User[] = await this.prisma.user.findMany({
			where: { blocked: { some: { id: blockedUser } } },
		});
		return blockedBy;
	}

	async addBlockedUser(
		userId: number,
		blockedId: number
	): Promise<UserEntity> {
		if (userId === blockedId) {
			throw new Error();
		}
		const blockedUser = await this.prisma.user.update({
			where: { id: userId },
			data: {
				blocked: {
					connect: { id: blockedId },
				},
				friends: {
					disconnect: { id: blockedId },
				},
			},
		});
		return blockedUser;
	}

	async deleteBlockedUser(
		userId: number,
		blockedId: number
	): Promise<UserEntity> {
		if (userId === blockedId) {
			throw new Error();
		}
		const blockedUser = await this.prisma.user.update({
			where: { id: userId },
			data: {
				blocked: {
					disconnect: { id: blockedId },
				},
			},
		});
		return blockedUser;
	}

	findById(id: number): Promise<UserEntity> {
		return this.prisma.user.findUniqueOrThrow({ where: { id: id } });
	}

	findFriends(id: number): Promise<Partial<Partial<UserEntity>>> {
		return this.prisma.user.findUniqueOrThrow({
			where: { id: id },
			select: {
				friends: {
					select: {
						id: true,
						username: true,
						avatarUrl: true,
					},
				},
			},
		});
	}

	async findChannel(id: number): Promise<Partial<Partial<UserEntity>>> {
		return this.prisma.user.findUniqueOrThrow({
			where: { id: id },
			select: {
				channelsProfiles: {
					select: {
						channelId: true,
						role: true,
						channel: {
							select: {
								channelName: true,
							},
						},
					},
				},
			},
		});
	}

	async findChannelProfiles(id: number) {
		return await this.prisma.user.findUniqueOrThrow({
			where: { id: id },
			select: {
				channelsProfiles: true,
			},
		});
	}

	updateUserName(userId: number, username: string): Promise<UserEntity> {
		return this.prisma.user.update({
			where: { id: userId },
			data: { username: username },
		});
	}

	async getAllUsers(): Promise<UserEntity[]> {
		return await this.prisma.user.findMany();
	}

	async getClassementWin(id: number): Promise<number> {
		let nbWinUser = await this.prisma.userOnGame.count({
			where: { userId: id, asWin: true },
		});
		let tmp = await this.prisma.userOnGame.groupBy({
			by: ['userId'],
			where: { asWin: true },
			having: {
				userId: { _count: { gt: nbWinUser } },
			},
		});
		return tmp.length + 1;
	}

	async getClassementLevel(id: number): Promise<number> {
		let levelUser = (
			await this.prisma.user.findUnique({
				where: { id },
				select: { level: true },
			})
		).level;
		let tmp = await this.prisma.user.findMany({
			where: { level: { gt: levelUser } },
		});
		return tmp.length + 1;
	}

	async getNbUser(): Promise<number> {
		console.log(await this.prisma.user.count());
		return await this.prisma.user.count();
	}
}
