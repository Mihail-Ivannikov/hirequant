import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter'; // <-- ADDED FOR BACKGROUND AI TASK

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2 // <-- ADDED FOR BACKGROUND AI TASK
  ) {}

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

    const application = await this.prisma.application.create({
      data: {
        vacancyId: vacancyId,
        candidateId: profile.id,
        coverLetter: data.coverLetter,
        testScore: score,
        resumeUrl: resumePath,
        status: 'PENDING'
      }
    });

    // =========================================================================
    // NEW LOGIC: Trigger Background AI Vector Analysis without delaying user
    // =========================================================================
    if (file) {
      this.eventEmitter.emit('cv.uploaded', {
        applicationId: application.id,
        vacancyId: vacancyId,
        candidateProfileId: profile.id,
        filePath: file.path
      });
    }
    // =========================================================================

    return application;
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

  async getVacancyApplicants(auth0Id: string, vacancyId: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user || user.role !== 'EMPLOYER') throw new ForbiddenException("Access denied");

    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        applications: {
          include: { candidate: true }
        }
      }
    });

    if (!vacancy || vacancy.employerId !== user.id) {
        throw new ForbiddenException("Access denied");
    }

    const applicants = await Promise.all(vacancy.applications.map(async (app) => {
        let aiScore = app.aiScore;
        let matchedSkills: string[] =[];
        let missingSkills: string[] =[...vacancy.skills];

        if (app.candidate.skills && app.candidate.skills.length > 0) {
            matchedSkills = vacancy.skills.filter(s =>
                app.candidate.skills.some(cs => cs.toLowerCase() === s.toLowerCase())
            );
            missingSkills = vacancy.skills.filter(s =>
                !app.candidate.skills.some(cs => cs.toLowerCase() === s.toLowerCase())
            );
        }

        if (aiScore === null) {
            const skillScore = vacancy.skills.length > 0
                ? Math.round((matchedSkills.length / vacancy.skills.length) * 100)
                : 85;

            aiScore = app.testScore !== null
                ? Math.round((skillScore * 0.7) + (app.testScore * 0.3))
                : skillScore;

            await this.prisma.application.update({
                where: { id: app.id },
                data: { aiScore }
            });
        }

        return {
            id: app.id,
            status: app.status,
            createdAt: app.createdAt,
            testScore: app.testScore,
            aiScore: aiScore,
            candidate: {
                id: app.candidate.id,
                fullName: app.candidate.fullName,
                headline: app.candidate.headline,
                avatarUrl: app.candidate.avatarUrl,
            },
            insights: {
                matchedSkills,
                missingSkills
            }
        };
    }));

    applicants.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

    return {
        vacancy: {
            id: vacancy.id,
            title: vacancy.title,
            createdAt: vacancy.createdAt,
            status: 'Active',
            totalApplicants: vacancy.applications.length
        },
        applicants
    };
  }

  async getApplicationDetails(auth0Id: string, applicationId: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user || user.role !== 'EMPLOYER') throw new ForbiddenException("Access denied");

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        vacancy: true,
      }
    });

    if (!application || application.vacancy.employerId !== user.id) {
      throw new ForbiddenException("Access denied");
    }

    let matchedSkills: string[] =[];
    let missingSkills: string[] =[...application.vacancy.skills];

    if (application.candidate.skills && application.candidate.skills.length > 0) {
      matchedSkills = application.vacancy.skills.filter(s =>
        application.candidate.skills.some(cs => cs.toLowerCase() === s.toLowerCase())
      );
      missingSkills = application.vacancy.skills.filter(s =>
        !application.candidate.skills.some(cs => cs.toLowerCase() === s.toLowerCase())
      );
    }

    const actualResumeUrl = application.resumeUrl === 'profile-linked' 
      ? application.candidate.resumeUrl 
      : application.resumeUrl;

    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      testScore: application.testScore,
      aiScore: application.aiScore,
      resumeUrl: actualResumeUrl,
      candidate: {
        id: application.candidate.id,
        fullName: application.candidate.fullName,
        headline: application.candidate.headline,
        avatarUrl: application.candidate.avatarUrl,
      },
      vacancy: {
        id: application.vacancy.id,
        title: application.vacancy.title,
        company: application.vacancy.company,
      },
      insights: {
        matchedSkills,
        missingSkills
      }
    };
  }

  async updateApplicationStatus(auth0Id: string, applicationId: string, status: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user || user.role !== 'EMPLOYER') throw new ForbiddenException("Access denied");

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { vacancy: true }
    });

    if (!application || application.vacancy.employerId !== user.id) {
      throw new ForbiddenException("Access denied");
    }

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(status)) throw new BadRequestException("Invalid status");

    const updatedApp = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: status as any }
    });

    return { success: true, status: updatedApp.status };
  }
}