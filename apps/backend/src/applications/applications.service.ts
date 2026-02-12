import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(auth0Id: string, vacancyId: string, data: any, file?: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const questions = await this.prisma.question.findMany({ where: { vacancyId } });
    
    let score: number | null = null; 

    if (questions.length > 0) {
        let correctCount = 0;
        questions.forEach(q => {
            if (data.answers && data.answers[q.id] === q.correct) {
                correctCount++;
            }
        });
        score = Math.round((correctCount / questions.length) * 100);
    }

    const profile = await this.prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: { 
        fullName: data.fullName,
      },
      create: { 
        userId: user.id, 
        fullName: data.fullName, 
        skills: [] 
      }
    });

    const resumePath = file ? file.path : (data.resumeOption === 'profile' ? 'profile-linked' : null);
    if (data.resumeOption === 'upload' && !file) {
      throw new BadRequestException("A file was expected but not provided for the 'upload' option.");
    }

    return this.prisma.application.create({
      data: {
        vacancyId: vacancyId,
        candidateId: profile.id,
        coverLetter: data.coverLetter,
        testScore: score,
        resumeUrl: resumePath,
        status: 'PENDING'
      }
    });
  }
}