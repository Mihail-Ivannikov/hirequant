import { Injectable, NotFoundException } from '@nestjs/common';
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
    
    const conditions: Prisma.VacancyWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { skills: { has: search } }, 
        ],
      });
    }

    if (type && type.length > 0) {
      conditions.push({
        type: { in: type },
      });
    }

    if (level && level.length > 0) {
      conditions.push({
        OR: level.map((l) => ({
          title: { contains: l, mode: 'insensitive' },
        })),
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

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
    if (!query || query.length < 2) return [];

    const results = await this.prisma.vacancy.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { skills: { has: query } },
        ],
      },
      select: {
        title: true,
        skills: true,
      },
      take: 10,
    });

    const suggestions = new Set<string>();
    results.forEach((job) => {
      if (job.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(job.title);
      }
      job.skills.forEach((skill) => {
        if (skill.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(skill);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  async findOne(id: string) {
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id },
      include: { employer: true },
    });

    if (!vacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    return vacancy;
  }

  async getQuestions(vacancyId: string) {
    return this.prisma.question.findMany({
      where: { vacancyId },
      select: {
        id: true,
        text: true,
        options: true,
      }
    });
  }
}