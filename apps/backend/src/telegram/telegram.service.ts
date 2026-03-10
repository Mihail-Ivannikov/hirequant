import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private readonly bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.error('TELEGRAM_BOT_TOKEN is not configured.');
      throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
    }
    this.bot = new Telegraf(token);
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, text);
      this.logger.log(`Message sent to chatId: ${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to send message to ${chatId}`, error.stack);
      throw new Error('Failed to send Telegram message.');
    }
  }

  async sendOtpToTestUser(otp: string): Promise<void> {
    const testChatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (!testChatId) {
      this.logger.error('TELEGRAM_CHAT_ID is not configured for testing.');
      return;
    }
    await this.sendMessage(testChatId, `Your verification code is: ${otp}`);
  }
}