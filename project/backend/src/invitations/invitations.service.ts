import { Injectable } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { PrismaService } from 'src/prisma.service';
import { Invitation, invitMode } from '@prisma/client';
import { DeleteInvitationDto } from './dto/delete-invitation.dto';

@Injectable()
export class InvitationsService {
	constructor(private prisma: PrismaService) {}

	// Returns null if the invite already exists, otherwise returns the
	// newly created invite.
	async createInvitation(
		type: invitMode,
		channelId: number,
		friendId: number,
		userId: number,
		username: string
	): Promise<Invitation | null> {
		if (type !== 'CHAT') {
			const exists: Invitation | null =
				await this.prisma.invitation.findFirst({
					where: {
						friendId: friendId,
						invitedUsers: { every: { id: userId } },
						type: type,
					},
				});
			if (exists) return null;
		}
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

	async getGameInvitation(friendId: number, userId: number) {
		const gameInvit = await this.prisma.invitation.findMany({
			where: {
				type: invitMode.GAME,
				friendId: friendId,
				invitedUsers: {
					some: { id: userId },
				},
			},
		});
		return gameInvit;
	}

	async getFriendInvitation(friendId: number, userId: number) {
		const friendInvit = await this.prisma.invitation.findMany({
			where: {
				type: invitMode.FRIEND,
				friendId: friendId,
				invitedUsers: {
					some: { id: userId },
				},
			},
		});
		return friendInvit;
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
