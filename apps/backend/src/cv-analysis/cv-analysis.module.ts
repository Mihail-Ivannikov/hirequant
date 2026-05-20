import { Module } from '@nestjs/common';
import { CvAnalysisService } from './cv-analysis.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers:[CvAnalysisService, PrismaService],
})
export class CvAnalysisModule {}