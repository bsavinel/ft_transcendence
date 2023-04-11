import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class MessagesService {
	constructor(private prisma: PrismaService) {}

	//TODO: verifier que le chan existe, le user existe, et qu'il ait les droits.
	async create(createMessageDto: CreateMessageDto): Promise<MessageEntity> {
		return this.prisma.message.create({
			data: createMessageDto,
		});
	}

	async findAllByUser(userId: number): Promise<Partial<MessageEntity>[]> {
		return this.prisma.message.findMany({
			where: { creatorId: userId },
			orderBy: { createdAt: 'asc' },
			select: { content: true, createdAt: true, channelId: true },
		});
	}

	async findAllByUserInChan(
		userId: number,
		chanId: number
	): Promise<Partial<MessageEntity>[]> {
		return this.prisma.message.findMany({
			where: { creatorId: userId, channelId: chanId },
			orderBy: { createdAt: 'asc' },
			select: { content: true, createdAt: true },
		});
	}

	// async findAllByChannel(chanId: number): Promise<Partial<MessageEntity>[]> {
	async findAllByChannel(chanId: number): Promise<Partial<MessageEntity>[]> {
		return this.prisma.message.findMany({
			where: { channelId: chanId },
			orderBy: { createdAt: 'asc' },
			select: {
				content: true,
				createdAt: true,
				creatorId: true,
				createdBy: { select: { username: true } },
			},
		});
	}
}
