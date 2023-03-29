import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  //ToDo:
  //- check chaque champs
  //- check throw error ?

  // GET REQUEST
  it("should get all user's info", async () => {
    const user = await service.findUnique(1);

    const expectUser = {
      id: expect.anything(),
      createAt: expect.anything(),
      updateAt: expect.anything(),
      username: expect.stringMatching(/John|Karen/),
      id42: expect.anything(),
      AvatarUrl: expect.stringContaining('AVATAR_PATH'),
      friends: null,
      friendsOf: null,
      chanelsProdiles: null,
      messageUser: null,
      gamePlay: null,
    };

    expect(user).toMatchObject(expectUser);
  });

  it("should get all user's friends", async () => {
    expect(service).toBeDefined();
  });

  it("should get all user's blocked asshole", async () => {
    expect(service).toBeDefined();
  });

  it("should get all user's channel", async () => {
    expect(service).toBeDefined();
  });

  it("should get all user's channel profil", async () => {
    expect(service).toBeDefined();
  });

  //POST REQUEST
  it('should add new friend', async () => {
    expect(service).toBeDefined();
  });

  it('should add new blocked user', async () => {
    expect(service).toBeDefined();
  });

  it('should create new channel', async () => {
    expect(service).toBeDefined();
  });

  // DELETE REQUEST
  it('should leave channel', async () => {
    expect(service).toBeDefined();
  });

  it("should get all user's friends", async () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
