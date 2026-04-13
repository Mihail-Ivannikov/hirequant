import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

  @UseGuards(AuthGuard('jwt'))
  @Get('user/role')
  async getUserRole(@Req() req) {
    return this.vacanciesService.getUserRole(req.user.auth0Id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('employer/dashboard')
  async getEmployerDashboard(@Req() req) {
    return this.vacanciesService.getEmployerDashboard(req.user.auth0Id);
  }

  // --- JOB CONSTRUCTOR ENDPOINTS ---

  @UseGuards(AuthGuard('jwt'))
  @Post('employer/create')
  async createVacancy(@Req() req, @Body() body: any) {
    return this.vacanciesService.createVacancy(req.user.auth0Id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('employer/edit/:id')
  async updateVacancy(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.vacanciesService.updateVacancy(req.user.auth0Id, id, body);
  }

  // ----------------------------------

  @Get(':id/questions')
  async getQuestions(@Param('id') id: string) {
    console.log(`Backend: Fetching questions for vacancy ID: ${id}`);
    return this.vacanciesService.getQuestions(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vacanciesService.findOne(id);
  }
}