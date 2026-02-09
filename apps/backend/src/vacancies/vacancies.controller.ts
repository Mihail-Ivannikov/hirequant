import { Controller, Get, Query, Param } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('level') level?: string,
    @Query('minSalary') minSalary?: string,
    @Query('maxSalary') maxSalary?: string,
  ) {
    return this.vacanciesService.findAll({
      search,
      type: type ? type.split(',') : undefined,
      level: level ? level.split(',') : undefined,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
    });
  }

  @Get('autocomplete')
  async autocomplete(@Query('query') query: string) {
    return this.vacanciesService.autocomplete(query);
  }

  // --- NEW ENDPOINT ADDED HERE ---
  // Must be after 'autocomplete' to avoid routing conflicts
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vacanciesService.findOne(id);
  }
}