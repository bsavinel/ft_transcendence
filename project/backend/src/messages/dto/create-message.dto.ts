import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  content: string;

  @IsNumber()
  @IsNotEmpty()
  creatorId: number;

  @IsNumber()
  @IsNotEmpty()
  channelId: number;
}
