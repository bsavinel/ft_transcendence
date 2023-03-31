import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const Chan_1 = await prisma.channel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      channelName: 'Channel 001',
      mode: 'PUBLIC',
    },
  });

  const Chan_2 = await prisma.channel.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
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
