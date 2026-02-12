import { Controller, Post, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

@Controller('vacancies')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/apply')
  @UseInterceptors(FileInterceptor('resume', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(pdf|docx)$/)) {
          return cb(new BadRequestException('Only PDF and DOCX files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  async apply(
    @Param('id') vacancyId: string, 
    @Body() body: any, 
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {
    let parsedAnswers = {};
    if (body.answers) {
      try {
        parsedAnswers = JSON.parse(body.answers);
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    }
    
    const application = await this.applicationsService.apply(
      req.user.auth0Id, 
      vacancyId, 
      { ...body, answers: parsedAnswers },
      file
    );

    return {
      success: true,
      message: "Application received",
      applicationId: application.id,
      score: application.testScore
    };
  }
}