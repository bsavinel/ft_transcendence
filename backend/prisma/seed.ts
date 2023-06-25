import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
	const Chan_1 = await prisma.channel.upsert({
		where: { id: 1 },
		update: {},
		create: {
			channelName: 'Channel 001',
			mode: 'PUBLIC',
		},
	});

	const Chan_2 = await prisma.channel.upsert({
		where: { id: 2 },
		update: {},
		create: {
			channelName: 'Channel 002',
			mode: 'PUBLIC',
		},
	});

	const John = await prisma.user.upsert({
		where: { username: 'John' },
		update: {},
		create: {
			username: 'John',
			id42: 42,
			avatarUrl: 'AVATAR_PATH',
			messagesUser: {
				create: [
					{
						content: 'Message de John',
						channelId: 1,
					},
					{
						content: 'Second message de John',
						channelId: 2,
					},
				],
			},
		},
	});

	await prisma.userOnChannel.upsert({
		where: { userId_channelId: { userId: 1, channelId: 1 } },
		create: { role: 'CREATOR', channelId: 1, userId: 1 },
		update: {},
	});
	await prisma.userOnChannel.upsert({
		where: { userId_channelId: { userId: 1, channelId: 2 } },
		create: { role: 'USER', channelId: 2, userId: 1 },
		update: {},
	});

	const Karen = await prisma.user.upsert({
		where: { username: 'Karen' },
		update: {},
		create: {
			username: 'Karen',
			id42: 43,
			avatarUrl: 'AVATAR_PATH',
			messagesUser: {
				create: [
					{
						content: 'Message de Karen',
						channelId: 1,
					},
					{
						content: 'Second message de Karen',
						channelId: 2,
					},
				],
			},
		},
	});

	await prisma.userOnChannel.upsert({
		where: { userId_channelId: { userId: 2, channelId: 2 } },
		create: { role: 'CREATOR', channelId: 2, userId: 2 },
		update: {},
	});
	await prisma.userOnChannel.upsert({
		where: { userId_channelId: { userId: 2, channelId: 1 } },
		create: { role: 'USER', channelId: 1, userId: 2 },
		update: {},
	});

	console.log({ John, Karen, Chan_1, Chan_2 });
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
