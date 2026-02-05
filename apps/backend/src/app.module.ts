import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VacanciesModule } from './vacancies/vacancies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    AuthModule,
    VacanciesModule,

  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}