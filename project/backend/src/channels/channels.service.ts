import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import {
	channelMode,
	Prisma,
	roleChannel,
	UserOnChannel,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ChannelEntity } from './entities/channel.entity';
import { UpdateChannelDto } from './dto/update-channel.dto';

//TODO: rajouter un join channel? Dans chan ou dans user?
//TODO: Et rajouter un truc pour set un utilisateur as admin (et remove rights)
//TODO: remplacer tous les 'me' par le access token id
@Injectable()
export class ChannelsService {
	constructor(private prisma: PrismaService) {}

	async create(
		createChannelDto: CreateChannelDto,
		me: number
	): Promise<ChannelEntity> {
		// if (createChannelDto?.mode === channelMode.PROTECTED)
		// 	throw new BadRequestException();
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
		// await this.prisma.userOnChannel.create({ data: newUserOnChannel });
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
			select: {channel: {select: {id: true, channelName: true}}},
		});
		const tab = res.map((data) => (data.channel));
		return tab;
	}

	// TODO: quand un chan est updated, faut y brancher un websocket pour annoncer a tout
	// le monde la mise a jour
	// TODO: check presence du password.
	async update(
		id: number,
		updateChannelDto: UpdateChannelDto
	): Promise<ChannelEntity> {
		return this.prisma.channel.update({
			where: { id: id },
			data: updateChannelDto,
		});
	}

	async remove(id: number): Promise<ChannelEntity> {
		return await this.prisma.channel.delete({
			where: {
				id: id,
			},
		});
	}
}
