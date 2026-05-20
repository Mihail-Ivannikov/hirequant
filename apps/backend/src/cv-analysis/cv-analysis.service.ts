import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs/promises';

export class CvUploadedEvent {
  applicationId: string;
  vacancyId: string;
  candidateProfileId: string;
  filePath: string;
}

@Injectable()
export class CvAnalysisService {
  private readonly logger = new Logger(CvAnalysisService.name);
  private readonly PYTHON_AI_URL = 'http://python-ai:8000/analyze';

  constructor(private prisma: PrismaService) {}

  @OnEvent('cv.uploaded', { async: true })
  async handleCvUploaded(payload: CvUploadedEvent): Promise<void> {
    const { applicationId, vacancyId, candidateProfileId, filePath } = payload;
    this.logger.log(`Базовий Vector AI запущено для заявки: ${applicationId}`);

    try {
      const cvText = await this._parsePdf(filePath);
      if (!cvText) return;

      const vacancy = await this.prisma.vacancy.findUnique({ where: { id: vacancyId } });
      if (!vacancy) {
        this.logger.error(`Vacancy ${vacancyId} not found.`);
        return;
      }

      const vacancyText = `${vacancy.title}. ${vacancy.description}. Skills: ${vacancy.skills.join(' ')}`;
      
      const targetSkills = vacancy.skills; 

      const response = await fetch(this.PYTHON_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resume_text: cvText, 
          vacancy_text: vacancyText, 
          vacancy_skills: targetSkills
        })
      });

      if (!response.ok) throw new Error(`Python API Failed: ${response.status}`);
      
      const result = await response.json();
      
      if (result.extracted_skills && result.extracted_skills.length > 0) {
        const profile = await this.prisma.candidateProfile.findUnique({ where: { id: candidateProfileId }});
        const currentSkills = profile?.skills ||[];
        const mergedSkills = Array.from(new Set([...currentSkills, ...result.extracted_skills]));

        await this.prisma.candidateProfile.update({
          where: { id: candidateProfileId },
          data: { skills: mergedSkills },
        });
      }

      await this.prisma.application.update({
        where: { id: applicationId },
        data: { aiScore: result.ai_score }
      });

      this.logger.log(`Аналіз завершено! Збіг (Vector AI Score): ${result.ai_score}%. Знайдено навичок: ${result.extracted_skills.length} ${JSON.stringify(result.extracted_skills)}`);
      
    } catch (error: any) {
      this.logger.error(`Помилка під час векторного аналізу: ${error.message}`);
    }
  }

  private async _parsePdf(filePath: string): Promise<string | null> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      
      const rawPdfParse = require('pdf-parse');
      
      if (rawPdfParse.PDFParse) {
        const parser = new rawPdfParse.PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        return result.text.replace(/\s+/g, ' ').trim();
      }
      
      const parseFunc = typeof rawPdfParse === 'function' ? rawPdfParse : rawPdfParse.default;
      if (typeof parseFunc === 'function') {
        const data = await parseFunc(dataBuffer);
        return data.text.replace(/\s+/g, ' ').trim();
      }

      throw new Error('pdf-parse format is unrecognized. Check installed version.');
    } catch (error: any) {
      this.logger.error(`Не вдалося прочитати PDF: ${error.message}`);
      return null;
    }
  }
}