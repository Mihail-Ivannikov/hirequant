import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VacanciesModule } from './vacancies/vacancies.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { TelegramModule } from './telegram/telegram.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CvAnalysisModule } from './cv-analysis/cv-analysis.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    EventEmitterModule.forRoot(),
    AuthModule,
    VacanciesModule,
    UsersModule,
    ApplicationsModule,
    TelegramModule,
    CvAnalysisModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}