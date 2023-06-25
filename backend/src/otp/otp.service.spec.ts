import { Test, TestingModule } from "@nestjs/testing";
import { OtpService } from "./otp.service";
import { PrismaModule } from "../prisma.module";

describe("OtpService", () => {
  let service: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [OtpService],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  it("should generate secret", async () => {
    const secret = await service.generate();
    expect(secret).toHaveLength(16);
  });

  it("should check if valid token can activate2FA", async () => {
    const secret = await service.generate();
    const token = await service.testToken(secret);
    const verify = await service.activate(token);
    expect(verify).toBeTruthy();
  });
});
