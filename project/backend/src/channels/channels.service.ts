import {
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { roleChannel, UserOnChannel } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ChannelEntity } from './entities/channel.entity';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { MessageEntity } from 'src/messages/entities/message.entity';
import * as bcrypt from 'bcrypt';

//TODO: Et rajouter un truc pour set un utilisateur as admin (et remove rights)
@Injectable()
export class ChannelsService {
	constructor(private prisma: PrismaService) {}

	async create(
		createChannelDto: CreateChannelDto,
		me: number
	): Promise<ChannelEntity> {
		if (createChannelDto.password) {
			const salt = await bcrypt.genSalt();
			const password = await bcrypt.hash(createChannelDto.password, salt);
			createChannelDto.password = password;
			createChannelDto = { ...createChannelDto, salt };
		}

		const newChan: ChannelEntity = await this.prisma.channel.create({
			data: createChannelDto,
		});
		const newUserOnChannel: UserOnChannel = {
			id: undefined,
			createdAt: undefined,
			updatedAt: undefined,
			role: roleChannel.CREATOR,
			channelId: newChan.id,
			userId: me,
			mutedAt: null,
		};
		await this.prisma.userOnChannel.create({ data: newUserOnChannel });
		return newChan;
	}

	async getChannelById(id: number): Promise<ChannelEntity> {
		return await this.prisma.channel.findUniqueOrThrow({
			where: { id: id },
		});
	}

	async getUserOnChannel(chanId: number): Promise<UserOnChannel[]> {
		return await this.prisma.userOnChannel.findMany({
			where: { channelId: chanId },
			orderBy: { user: { username: 'asc' } },
		});
	}

	async muteUserOnChan(userId: number, chanId: number): Promise<string> {
		const target = await this.prisma.userOnChannel.update({
			where: {
				userId_channelId: {
					userId: userId,
					channelId: chanId,
				},
			},
			data: { mutedAt: new Date() },
			select: {
				user: { select: { username: true } },
				channel: { select: { channelName: true } },
			},
		});
		return `User ${target.user.username} has been kicked from chan ${target.channel.channelName}.`;
	}

	async banUserOnChan(userId: number, chanId: number): Promise<string> {
		const target = await this.prisma.userOnChannel.update({
			where: {
				userId_channelId: {
					userId: userId,
					channelId: chanId,
				},
			},
			data: { role: 'BAN' },
			select: {
				user: { select: { username: true } },
				channel: { select: { channelName: true } },
			},
		});
		return `User ${target.user.username} has been kicked from chan ${target.channel.channelName}.`;
	}

	async kickUserOnchan(userId: number, chanId: number): Promise<string> {
		const target = await this.prisma.userOnChannel.delete({
			where: {
				userId_channelId: {
					userId: userId,
					channelId: chanId,
				},
			},
			select: {
				user: { select: { username: true } },
				channel: { select: { channelName: true } },
			},
		});
		return `User ${target.user.username} has been kicked from chan ${target.channel.channelName}.`;
	}

	async findUserOnChan(
		userId: number,
		chanId: number
	): Promise<UserOnChannel> {
		return await this.prisma.userOnChannel.findUniqueOrThrow({
			where: {
				userId_channelId: {
					userId: userId,
					channelId: chanId,
				},
			},
		});
	}

	async changeRights(
		userId: number,
		chanId: number,
		role: roleChannel
	): Promise<string> {
		const target = await this.prisma.userOnChannel.update({
			where: {
				userId_channelId: {
					userId: userId,
					channelId: chanId,
				},
			},
			data: { role: role },
			select: {
				user: { select: { username: true } },
				channel: { select: { channelName: true } },
			},
		});
		return 'Success';
	}

	async joinChan(
		me: number,
		chanId: number,
		password?: string
	): Promise<ChannelEntity> {
		const newUserOnChannel: UserOnChannel = {
			id: undefined,
			createdAt: undefined,
			updatedAt: undefined,
			role: roleChannel.USER,
			channelId: chanId,
			userId: me,
			mutedAt: null,
		};
		const chan = await this.prisma.channel.findUniqueOrThrow({
			where: { id: chanId },
		});
		if (chan.mode === 'PROTECTED') {
			if (!password)
				throw new HttpException(
					'Password needed',
					HttpStatus.FORBIDDEN
				);
			const hash: string = await this.getHash(chanId);
			const compare: boolean = await bcrypt.compare(password, hash);
			if (compare === false) {
				throw new HttpException('Wrong password', HttpStatus.FORBIDDEN);
			}
		}
		const joinedChan: ChannelEntity = (
			await this.prisma.userOnChannel.upsert({
				where: {
					userId_channelId: {
						userId: me,
						channelId: chanId,
					},
				},
				create: newUserOnChannel,
				update: newUserOnChannel,
				select: { channel: true },
			})
		).channel;
		return joinedChan;
	}

	async suscribedChannels(me: number) {
		const res = await this.prisma.userOnChannel.findMany({
			where: { userId: me, role: { not: 'BAN' } },
			select: { channel: true },
		});
		const tab = res.map((data) => data.channel);
		return tab;
	}

	async update(
		id: number,
		updateChannelDto: UpdateChannelDto
	): Promise<ChannelEntity> {
		if (updateChannelDto.password) {
			const salt = await bcrypt.genSalt();
			const password = await bcrypt.hash(updateChannelDto.password, salt);
			return this.prisma.channel.update({
				where: { id: id },
				data: {
					mode: updateChannelDto.mode,
					password: password,
					salt: salt,
				},
			});
		}
		return this.prisma.channel.update({
			where: { id: id },
			data: updateChannelDto,
		});
	}

	async leaveChan(userId: number, chanId: number): Promise<string> {
		try {
			await this.prisma.userOnChannel.delete({
				where: {
					userId_channelId: {
						userId: userId,
						channelId: chanId,
					},
				},
			});
		} catch (e) {
			if (e.meta && e.meta.cause)
				throw new HttpException(e.meta.cause, HttpStatus.NOT_FOUND);
			throw e;
		}
		return 'Success';
	}

	async getMessages(
		userId: number,
		chanId: number
	): Promise<Partial<MessageEntity>[]> {
		return await this.prisma.message.findMany({
			where: {
				channelId: chanId,
				createdBy: { blockedBy: { none: { id: userId } } },
			},
			orderBy: { createdAt: 'asc' },
			select: {
				content: true,
				createdAt: true,
				creatorId: true,
				createdBy: { select: { username: true } },
			},
		});
	}

	async remove(chanId: number): Promise<ChannelEntity> {
		try {
			return await this.prisma.channel.delete({
				where: {
					id: chanId,
				},
			});
		} catch (e) {
			if (e.meta && e.meta.cause)
				throw new HttpException(e.meta.cause, HttpStatus.NOT_FOUND);
			throw e;
		}
	}

	async getPublicChannel(offset: number): Promise<any> {
		await this.prisma.channel.findMany({
			where: {
				mode: { equals: 'PUBLIC' },
			},
			take: offset,
		});
	}

	async getProtectedChannel(offset: number): Promise<any> {
		await this.prisma.channel.findMany({
			where: {
				mode: { equals: 'PROTECTED' },
			},
			take: offset,
		});
	}

	async getDirectChannel(userId: number): Promise<ChannelEntity[]> {
		const directChannel = await this.prisma.channel.findMany({
			where: {
				mode: { equals: 'DIRECT' },
				participants: { some: { userId: userId } },
			},
		});
		return directChannel;
	}

	async getNonPrivateChannel(
		take: number,
		skip: number,
		userId: number
	): Promise<ChannelEntity[]> {
		const nonPrivateChannel = await this.prisma.channel.findMany({
			where: {
				mode: { not: 'PRIVATE' },
				participants: {
					none: { userId: userId },
					every: { role: { not: 'BAN' } },
				},
			},
			skip: skip,
			take: take,
		});
		return nonPrivateChannel;
	}

	async getHash(chanId: number): Promise<string> {
		const chan = await this.prisma.channel.findUniqueOrThrow({
			where: { id: chanId },
			select: { password: true },
		});
		return chan.password;
	}
}
