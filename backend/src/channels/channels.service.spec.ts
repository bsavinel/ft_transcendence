import { Test, TestingModule } from '@nestjs/testing';
import { Channel } from '@prisma/client';
import { PrismaModule } from '../prisma.module';
import { ChannelsService } from './channels.service';

describe('ChannelsService', () => {
  let service: ChannelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ChannelsService],
    }).compile();

    service = module.get<ChannelsService>(ChannelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //TODO: tester quand db vide
  it('should respond with all channels', async () => {
    const chans = await service.findAll();
    const resultMustBe: Channel[] = [
      {
        id: 2,
        createdAt: expect.anything(),
        updateAt: expect.anything(),
        channelName: 'Channel 002',
        password: null,
        mode: 'PUBLIC',
      },
      {
        id: 1,
        createdAt: expect.anything(),
        updateAt: expect.anything(),
        channelName: 'Channel 001',
        password: 'lala',
        mode: 'PROTECTED',
      },
    ];
    expect(chans).toEqual(resultMustBe);
  });

  // Rqst ok
  it('should respond with the id 1 channel', async () => {
    const response = await service.findOne(1);
    const chan1: Channel = {
      id: 1,
      createdAt: expect.anything(),
      updateAt: expect.anything(),
      channelName: 'Channel 001',
      password: 'lala',
      mode: 'PROTECTED',
    };

    expect(response).toEqual(chan1);
  });

  // Bad id
  it('should rejects', async () => {
    expect(service.findOne(140)).rejects.toThrow('No Channel found');
  });
=======
>>>>>>> origin/main
});
