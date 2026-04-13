import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(auth0Id: string, vacancyId: string, data: any, file?: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new BadRequestException("User not found");

    const questions = await this.prisma.question.findMany({ where: { vacancyId } });
    let score: number | null = null;

    if (questions.length > 0) {
        let correctCount = 0;
        questions.forEach(q => {
            if (data.answers && data.answers[q.id] === q.correct) correctCount++;
        });
        score = Math.round((correctCount / questions.length) * 100);
    }

    const profile = await this.prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: { fullName: data.fullName },
      create: { userId: user.id, fullName: data.fullName, skills:[] }
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

  async getMyApplications(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: { profile: true }
    });
    if (!user || !user.profile) throw new BadRequestException('User profile not found');

    return this.prisma.application.findMany({
      where: { candidateId: user.profile.id },
      include: {
        vacancy: { select: { title: true, company: true, id: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getMessages(auth0Id: string, applicationId: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id }, include: { profile: true } });
    const application = await this.prisma.application.findUnique({ where: { id: applicationId }, include: { vacancy: true } });
    
    if (!application || !user) throw new BadRequestException("Invalid request");
    if (application.candidateId !== user.profile?.id && application.vacancy.employerId !== user.id) {
        throw new ForbiddenException("Access denied");
    }

    return this.prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, role: true, profile: { select: { fullName: true, avatarUrl: true } } } } }
    });
  }

  async sendMessage(auth0Id: string, applicationId: string, content: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id }, include: { profile: true } });
    const application = await this.prisma.application.findUnique({ where: { id: applicationId }, include: { vacancy: true } });
    
    if (!application || !user) throw new BadRequestException("Invalid request");
    if (application.candidateId !== user.profile?.id && application.vacancy.employerId !== user.id) {
        throw new ForbiddenException("Access denied");
    }

    return this.prisma.message.create({
      data: { content, applicationId, senderId: user.id },
      include: { sender: { select: { id: true, role: true, profile: { select: { fullName: true, avatarUrl: true } } } } }
    });
  }
}