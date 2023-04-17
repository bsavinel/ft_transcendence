import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { roleChannel, UserOnChannel } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ChannelEntity } from './entities/channel.entity';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { MessageEntity } from 'src/messages/entities/message.entity';

//TODO: Et rajouter un truc pour set un utilisateur as admin (et remove rights)
@Injectable()
export class ChannelsService {
	constructor(private prisma: PrismaService) {}

	async create(
		createChannelDto: CreateChannelDto,
		me: number
	): Promise<ChannelEntity> {
		console.log(createChannelDto);
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
		};
		await this.prisma.userOnChannel.create({ data: newUserOnChannel });
		return newChan;
	}

	//TODO: if chan is protected: ask pass; Check if user is not kick or ban.
	async joinChan(me: number, chanId: number): Promise<string> {
		const newUserOnChannel: UserOnChannel = {
			id: undefined,
			createdAt: undefined,
			updatedAt: undefined,
			role: roleChannel.USER,
			channelId: chanId,
			userId: me,
		};
		await this.prisma.userOnChannel.upsert({
			where: {
				userId_channelId: {
					userId: me,
					channelId: chanId,
				},
			},
			create: newUserOnChannel,
			update: newUserOnChannel,
		});
		return 'Success';
	}

	async suscribedChannels(me: number) {
		const res = await this.prisma.userOnChannel.findMany({
			where: { userId: me, role: { not: 'BAN' } },
			select: { channel: { select: { id: true, channelName: true } } },
		});
		const tab = res.map((data) => data.channel);
		return tab;
	}

	// TODO: quand un chan est updated, faut y brancher un websocket pour annoncer a tout
	// le monde la mise a jour
	async update(
		id: number,
		updateChannelDto: UpdateChannelDto
	): Promise<ChannelEntity> {
		return this.prisma.channel.update({
			where: { id: id },
			data: updateChannelDto,
		});
	}

	async leaveChan(userId: number, chanId: number): Promise<string> {
		const participants: UserOnChannel[] = (
			await this.prisma.userOnChannel.delete({
				where: {
					userId_channelId: {
						userId: userId,
						channelId: chanId,
					},
				},
				select: {
					channel: {
						select: {
							participants: {
								where: { userId: { not: userId } },
							},
						},
					},
				},
			})
		).channel.participants;
		if (participants.length === 0) {
			await this.prisma.channel.delete({ where: { id: chanId } });
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
		return await this.prisma.channel.delete({
			where: {
				id: chanId,
			},
		});
	}

	async getPublicChannel(offset: number): Promise<any> {
		const publicChannel = await this.prisma.channel.findMany({
			where: {
				mode: { equals: 'PUBLIC' },
			},
			take: offset,
		});
		console.log('getPublicChannel', publicChannel);
	}

	async getProtectedChannel(offset: number): Promise<any> {
		const protectedChannel = await this.prisma.channel.findMany({
			where: {
				mode: { equals: 'PROTECTED' },
			},
			take: offset,
		});
		console.log('getProtectedChannel', protectedChannel);
	}

	async getNonPrivateChannel(
		take: number,
		skip: number
	): Promise<ChannelEntity[]> {
		const nonPrivateChannel = await this.prisma.channel.findMany({
			where: {
				mode: { not: 'PRIVATE' },
			},
			skip: skip,
			take: take,
		});
		return nonPrivateChannel;
	}
}
