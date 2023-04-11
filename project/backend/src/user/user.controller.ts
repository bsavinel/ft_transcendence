import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { Express } from 'express';
import { diskStorage } from 'multer';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/',
      }),
    }),
  )
  UploadAvatar(@UploadedFile() avatar: Express.Multer.File) {
    console.log(avatar);
    return this.userService.SaveAvatar();
  }
}
