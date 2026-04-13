import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

interface FilterParams {
  search?: string;
  type?: string[];
  level?: string[];
  minSalary?: number;
  maxSalary?: number;
}

@Injectable()
export class VacanciesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FilterParams) {
    const { search, type, level, minSalary, maxSalary } = params;
    const where: Prisma.VacancyWhereInput = {};
    const conditions: Prisma.VacancyWhereInput[] =[];

    if (search) {
      conditions.push({
        OR:[
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { skills: { has: search } },
        ],
      });
    }

    if (type && type.length > 0) conditions.push({ type: { in: type } });

    if (level && level.length > 0) {
      conditions.push({
        OR: level.map((l) => ({ title: { contains: l, mode: 'insensitive' } })),
      });
    }

    if (conditions.length > 0) where.AND = conditions;

    let vacancies = await this.prisma.vacancy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { employer: true },
    });

    if (minSalary !== undefined || maxSalary !== undefined) {
      vacancies = vacancies.filter((job) => {
        const matches = job.salary.match(/(\d+)/g);
        if (!matches || matches.length === 0) return false;
        const jobMin = parseInt(matches[0], 10);
        const jobMax = matches.length > 1 ? parseInt(matches[1], 10) : jobMin;
        if (minSalary !== undefined && !isNaN(minSalary) && jobMax < minSalary) return false;
        if (maxSalary !== undefined && !isNaN(maxSalary) && jobMin > maxSalary) return false;
        return true;
      });
    }

    return vacancies;
  }

  async autocomplete(query: string) {
    if (!query || query.length < 2) return[];
    const results = await this.prisma.vacancy.findMany({
      where: {
        OR:[
          { title: { contains: query, mode: 'insensitive' } },
          { skills: { has: query } },
        ],
      },
      select: { title: true, skills: true },
      take: 10,
    });

    const suggestions = new Set<string>();
    results.forEach((job) => {
      if (job.title.toLowerCase().includes(query.toLowerCase())) suggestions.add(job.title);
      job.skills.forEach((skill) => {
        if (skill.toLowerCase().includes(query.toLowerCase())) suggestions.add(skill);
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  async findOne(id: string) {
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id },
      include: { employer: true, questions: true },
    });
    if (!vacancy) throw new NotFoundException(`Vacancy with ID ${id} not found`);
    return vacancy;
  }

  async getQuestions(vacancyId: string) {
    return this.prisma.question.findMany({
      where: { vacancyId },
      select: { id: true, text: true, options: true, correct: true }
    });
  }

  // --- ROLE & DASHBOARD LOGIC ---

  async getUserRole(auth0Id: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user) throw new NotFoundException('User not found');
    return { role: user.role };
  }

  async getEmployerDashboard(auth0Id: string) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });

    if (!user || user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Access denied. Only employers can access this dashboard.');
    }

    const vacancies = await this.prisma.vacancy.findMany({
      where: { employerId: user.id },
      include: {
        applications: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalApplicants = 0;
    let newApplicants = 0;

    const formattedVacancies = vacancies.map(v => {
      const applicantsCount = v.applications.length;
      const newCount = v.applications.filter(a => a.status === 'PENDING').length;

      totalApplicants += applicantsCount;
      newApplicants += newCount;

      return {
        id: v.id,
        title: v.title,
        createdAt: v.createdAt,
        status: 'Open', 
        applicantsCount,
        newApplicantsCount: newCount
      };
    });

    return {
      stats: {
        activeJobs: vacancies.length,
        totalApplicants,
        newApplicants
      },
      vacancies: formattedVacancies
    };
  }

  // --- JOB CONSTRUCTOR LOGIC (CREATE / EDIT) ---

  async createVacancy(auth0Id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user || user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only verified employers can create vacancies.');
    }

    if (!data.title || !data.description || !data.skills || data.skills.length === 0) {
      throw new BadRequestException('Job title, description, and at least one skill are required.');
    }

    return this.prisma.vacancy.create({
      data: {
        title: data.title,
        company: user.companyName || 'Undisclosed Company',
        location: data.location,
        salary: data.salary,
        type: data.type,
        description: data.description,
        skills: data.skills,
        employerId: user.id,
        questions: {
          create: data.questions?.map((q: any) => ({
            text: q.text,
            options: q.options,
            correct: q.correct
          })) ||[]
        }
      }
    });
  }

  async updateVacancy(auth0Id: string, vacancyId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { auth0Id } });
    if (!user || user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only verified employers can edit vacancies.');
    }

    const existingVacancy = await this.prisma.vacancy.findUnique({ where: { id: vacancyId } });
    if (!existingVacancy) {
      throw new NotFoundException('Vacancy not found.');
    }
    if (existingVacancy.employerId !== user.id) {
      throw new ForbiddenException('You do not have permission to edit this vacancy.');
    }

    // Because applications store the integer 'testScore' directly, it is perfectly safe 
    // to delete and recreate the questions without breaking past applicant records.
    return this.prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { vacancyId } });

      return tx.vacancy.update({
        where: { id: vacancyId },
        data: {
          title: data.title,
          location: data.location,
          salary: data.salary,
          type: data.type,
          description: data.description,
          skills: data.skills,
          questions: {
            create: data.questions?.map((q: any) => ({
              text: q.text,
              options: q.options,
              correct: q.correct
            })) ||[]
          }
        }
      });
    });
  }
}