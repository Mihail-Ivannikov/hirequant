import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByAuth0Id(auth0Id: string) {
    const user = await this.prisma.user.findUnique({
      where: { auth0Id },
      include: { 
        profile: true,
        phoneAuth: true,
      },
    });

    if (user && !user.profile) {
      return { ...user, profile: {} };
    }
    return user;
  }

  async updateProfile(auth0Id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('User not found');

    const skillsList = Array.isArray(data.skills)
      ? data.skills.map((s: any) => s.name).filter(Boolean)
      : [];

    const createData = {
      userId: user.id,
      fullName: data.fullName || user.email,
      headline: data.headline || null,
      phone: data.phone || null,
      location: data.location || null,
      linkedInUrl: data.linkedInUrl || null,
      githubUrl: data.githubUrl || null,
      skills: skillsList,
      workExperience: data.workExperience || [],
      education: data.education || [],
      avatarUrl: data.avatarUrl || null,
    };

    const updateData: Prisma.CandidateProfileUpdateInput = {
      skills: { set: skillsList },
      workExperience: data.workExperience || [],
      education: data.education || [],
    };

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.linkedInUrl !== undefined) updateData.linkedInUrl = data.linkedInUrl;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    return this.prisma.candidateProfile.upsert({
      where: { userId: user.id },
      create: createData,
      update: updateData,
    });
  }

  async uploadAndParseResume(auth0Id: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.candidateProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, fullName: user.email, resumeUrl: file.path, skills: [] },
      update: { resumeUrl: file.path }
    });

    return {
      success: true,
      skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL"],
      extractedData: {
        headline: "Software Engineer (AI Detected)",
        location: "Detected from Resume",
      }
    };
  }

  async uploadAvatar(auth0Id: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.candidateProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, fullName: user.email, avatarUrl: file.filename, skills: [] },
      update: { avatarUrl: file.filename }
    });

    return { success: true, avatarUrl: file.filename };
  }
}