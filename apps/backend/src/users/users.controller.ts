import { 
  Controller, 
  Get, 
  Patch, 
  Post, 
  Body, 
  Req, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Req() req) {
    return this.usersService.findByAuth0Id(req.user.auth0Id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateProfile(@Req() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user.auth0Id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me/resume')
  @UseInterceptors(FileInterceptor('resume', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(pdf)$/i)) {
        return cb(new BadRequestException('Only PDF files are allowed for resumes!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadResume(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.usersService.uploadAndParseResume(req.user.auth0Id, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new BadRequestException('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.usersService.uploadAvatar(req.user.auth0Id, file);
  }
}