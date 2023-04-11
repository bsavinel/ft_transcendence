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

//TODO: remplacer tous les 'me' par le access token id
@Injectable()
export class ChannelsService {
	constructor(private prisma: PrismaService) {}

	async create(
		createChannelDto: CreateChannelDto,
		me: number
	): Promise<ChannelEntity> {
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

	async findOne(id: number): Promise<ChannelEntity> {
		return this.prisma.channel.findUniqueOrThrow({
			where: {
				id: id,
			},
		});
	}

	// TODO: quand un chan est updated, faut y brancher un websocket pour annoncer a tout
	// le monde la mise a jour
	// TODO: verifier les rights du gars qui modifie le mode, et check presence du password.
	async update(
		id: number,
		updateChannelDto: UpdateChannelDto,
		me: number
	): Promise<ChannelEntity> {
		return this.prisma.channel.update({
			where: { id: id },
			data: updateChannelDto,
		});
	}

	// TODO: check rights
	async remove(id: number): Promise<ChannelEntity> {
		return await this.prisma.channel.delete({
			where: {
				id: id,
			},
		});
	}

	// 	// Return all channels
	// 	async findAll(): Promise<ChannelEntity[]> {
	// 		return this.prisma.channel.findMany({ orderBy: { createdAt: 'asc' } });
	// 	}

	// 	async findProtected(): Promise<ChannelEntity[]> {
	// 		return this.prisma.channel.findMany({
	// 			where: { mode: 'PROTECTED' },
	// 			orderBy: { createdAt: 'asc' },
	// 		});
	// 	}

	// 	async getMode(id: number): Promise<{ mode: channelMode }> {
	// 		return this.prisma.channel.findUniqueOrThrow({
	// 			where: {
	// 				id: id,
	// 			},
	// 			select: {
	// 				mode: true,
	// 			},
	// 		});
	// 	}

	// 	async getName(id: number): Promise<{ channelName: string }> {
	// 		return this.prisma.channel.findUniqueOrThrow({
	// 			where: {
	// 				id: id,
	// 			},
	// 			select: {
	// 				channelName: true,
	// 			},
	// 		});
	// 	}

	// 	// Return all PUBLIC channels
	// 	async findPublic(): Promise<ChannelEntity[]> {
	// 		return this.prisma.channel.findMany({
	// 			where: { mode: 'PUBLIC' },
	// 			orderBy: { createdAt: 'asc' },
	// 		});
	// 	}
}
//TODO: rajouter un join channel? Dans chan ou dans user?
//TODO: Et rajouter un truc pour set un utilisateur as admin (et remove rights)
