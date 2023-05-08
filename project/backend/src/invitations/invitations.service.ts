import { Injectable } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { PrismaService } from 'src/prisma.service';
import { invitMode } from '@prisma/client';
import { DeleteInvitationDto } from './dto/delete-invitation.dto';

@Injectable()
export class InvitationsService {
	constructor(private prisma: PrismaService) {}

	async createInvitation(
		type: invitMode,
		channelId: number,
		friendId: number,
		userId: number,
		username: string
	) {
		const channelInvitation = await this.prisma.invitation.create({
			data: {
				type: type,
				channelId: channelId,
				friendId: friendId,
				username: username,
				invitedUsers: {
					connect: [{ id: userId }],
				},
			},
		});
		return channelInvitation;
	}

	//TODO
	//rendre cette function generique pour eviter les doublon a la con

	// invitMode: any
	// Get all invitation for one user
	async getInvitation(userId: number) {
		const invit = await this.prisma.invitation.findMany({
			where: {
				invitedUsers: {
					some: { id: userId },
				},
			},
		});
		return invit;
	}

	// invitMode: Channel
	// Get only invitation for {channelId} for one user
	async getChannelInvitation(channelId: number, userId: number) {
		const channelInvitation = await this.prisma.invitation.findMany({
			where: {
				channelId: channelId,
				invitedUsers: {
					some: {
						id: userId,
					},
				},
			},
		});
		return channelInvitation;
	}

	// invitMode: Channel
	// Get all channel invitation for one user
	async getAllChannelInvitation(userId: number) {
		const channelInvitation = await this.prisma.invitation.findMany({
			where: {
				invitedUsers: {
					some: {
						id: userId,
					},
				},
			},
		});
		return channelInvitation;
	}

	async deleteInvitation(invit: DeleteInvitationDto) {
		const channelInvitation = await this.prisma.invitation.deleteMany({
			where: {
				type: invit.type,
				friendId: invit.friendId,
				channelId: invit.channelId,
				invitedUsers: {
					some: {
						id: invit.invitedUsers,
					},
				},
			},
		});
		return channelInvitation;
	}
}
