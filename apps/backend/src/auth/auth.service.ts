import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TelegramService } from '../telegram/telegram.service';
import { TwoFactorAuthService } from './2fa.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly telegramService: TelegramService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  // --- Lab 2.1: Registration Flow ---

  async registerStart(phone: string): Promise<{ message: string }> {
    const existingAuth = await this.prisma.userAuth.findUnique({
      where: { phone },
    });
    if (existingAuth) {
      throw new ConflictException('A user with this phone number already exists.');
    }

    const otp = randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.userAuth.upsert({
      where: { phone },
      update: { otp, otpExpiresAt },
      create: {
        phone,
        otp,
        otpExpiresAt,
        password: 'PENDING_REGISTRATION',
        userId: 'PENDING_REGISTRATION',
      },
    });

    await this.telegramService.sendOtpToTestUser(otp);
    return { message: 'Verification code sent to your Telegram.' };
  }

  private async verifyOtp(phone: string, otp: string) {
    const authRecord = await this.prisma.userAuth.findUnique({ where: { phone } });
    if (!authRecord || !authRecord.otp || !authRecord.otpExpiresAt) {
      throw new NotFoundException('No pending registration found for this number.');
    }
    if (authRecord.otp !== otp) {
      throw new UnauthorizedException('Invalid verification code.');
    }
    if (new Date() > authRecord.otpExpiresAt) {
      throw new UnauthorizedException('Verification code has expired.');
    }
    return authRecord;
  }

  async registerComplete(phone: string, otp: string, pass: string): Promise<{ qrCodeUrl: string }> {
    const authRecord = await this.verifyOtp(phone, otp);

    if (authRecord.userId !== 'PENDING_REGISTRATION') {
      throw new ConflictException('This phone number has already been registered.');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const twoFactorSecret = this.twoFactorAuthService.generateSecret();

    const placeholderEmail = `${phone}@phone-auth.local`;
    const placeholderAuth0Id = `phone|${phone}`;

    try {
      await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { email: placeholderEmail, auth0Id: placeholderAuth0Id, role: 'CANDIDATE' },
        });

        await tx.userAuth.update({
          where: { phone },
          data: {
            password: hashedPassword,
            twoFactorSecret,
            userId: newUser.id,
            otp: null,
            otpExpiresAt: null,
          },
        });
      });
    } catch (error) {
        await this.prisma.userAuth.delete({ where: { phone } }).catch(() => {});
        throw new InternalServerErrorException('Failed to create account. Please try again.');
    }

    const otpAuthUrl = this.twoFactorAuthService.getAuthenticatorOtpAuthUrl(
        'MyMessengerApp', phone, twoFactorSecret,
    );

    const qrCodeUrl = await this.twoFactorAuthService.generateQrCodeDataURL(otpAuthUrl);
    return { qrCodeUrl };
  }

  async enableTwoFactorAuth(phone: string, twoFactorCode: string): Promise<{ message: string }> {
    const authRecord = await this.prisma.userAuth.findUnique({ where: { phone } });
    if (!authRecord || !authRecord.twoFactorSecret) {
      throw new NotFoundException('User not found or 2FA not initiated.');
    }

    const isValid = this.twoFactorAuthService.isTwoFactorCodeValid(twoFactorCode, authRecord);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code.');
    }

    await this.prisma.userAuth.update({
      where: { phone },
      data: { isTwoFactorEnabled: true },
    });

    return { message: '2FA has been successfully enabled.' };
  }

  // --- Lab 2.2: Login & Recovery Flow ---

  private async generateTokens(userId: string, phone: string): Promise<{ accessToken: string }> {
    const payload = { sub: userId, phone };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async login(phone: string, pass: string, twoFactorCode?: string): Promise<{ accessToken: string } | { twoFactorRequired: boolean }> {
    const authRecord = await this.prisma.userAuth.findUnique({ where: { phone } });

    if (!authRecord || authRecord.userId === 'PENDING_REGISTRATION') {
      throw new NotFoundException('User not found.');
    }

    const isPasswordMatch = await bcrypt.compare(pass, authRecord.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (authRecord.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        return { twoFactorRequired: true };
      }
      const is2faValid = this.twoFactorAuthService.isTwoFactorCodeValid(twoFactorCode, authRecord);
      if (!is2faValid) {
        throw new UnauthorizedException('Invalid 2FA code.');
      }
    }

    return this.generateTokens(authRecord.userId, authRecord.phone);
  }

  async setPin(userId: string, pin: string): Promise<{ message: string }> {
    const hashedPin = await bcrypt.hash(pin, 10);
    const validityMinutes = parseInt(this.configService.get('PIN_CODE_VALIDITY_MINUTES', '5'), 10);
    const pinCodeExpiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);

    await this.prisma.userAuth.update({
      where: { userId },
      data: { pinCode: hashedPin, pinCodeExpiresAt },
    });

    return { message: `PIN code set. It will be valid for ${validityMinutes} minutes.` };
  }

  // --- Password Recovery ---

  async recoverStart(phone: string): Promise<{ message: string }> {
    const authRecord = await this.prisma.userAuth.findUnique({ where: { phone } });
    if (!authRecord || authRecord.userId === 'PENDING_REGISTRATION') {
      throw new NotFoundException('Account not found for this phone number.');
    }

    const otp = randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.userAuth.update({
      where: { phone },
      data: { otp, otpExpiresAt },
    });

    await this.telegramService.sendOtpToTestUser(otp);
    return { message: 'A recovery code has been sent to your Telegram.' };
  }

  async recoverComplete(phone: string, otp: string, pin: string, newPassword: string): Promise<{ message: string }> {
    const authRecord = await this.verifyOtp(phone, otp);

    if (!authRecord.pinCode || !authRecord.pinCodeExpiresAt) {
      throw new BadRequestException('PIN code not set. Please log in to set a PIN.');
    }
    if (new Date() > authRecord.pinCodeExpiresAt) {
      throw new UnauthorizedException('PIN code has expired.');
    }

    const isPinMatch = await bcrypt.compare(pin, authRecord.pinCode);
    if (!isPinMatch) {
      throw new UnauthorizedException('Invalid PIN code.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.userAuth.update({
      where: { phone },
      data: {
        password: hashedNewPassword,
        otp: null,
        otpExpiresAt: null,
        pinCode: null,
        pinCodeExpiresAt: null,
      },
    });

    return { message: 'Your password has been successfully reset.' };
  }

  // --- Auth0 Specific Methods ---

  async syncUser(user: { auth0Id: string; email: string }) {
    const existingByAuth0 = await this.prisma.user.findUnique({
      where: { auth0Id: user.auth0Id },
    });

    if (existingByAuth0) return existingByAuth0;

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingByEmail) {
      if (existingByEmail.auth0Id && existingByEmail.auth0Id !== user.auth0Id) {
        throw new ConflictException('This email is already linked to another account.');
      }
      return this.prisma.user.update({
        where: { id: existingByEmail.id },
        data: { auth0Id: user.auth0Id },
      });
    }

    return this.prisma.user.create({
      data: {
        email: user.email,
        auth0Id: user.auth0Id,
        role: 'CANDIDATE',
      },
    });
  }

  async generate2FAForAuth0User(authUser: any): Promise<{ qrCodeUrl: string }> {
    const user = await this.prisma.user.findUnique({ where: { auth0Id: authUser.auth0Id } });
    if (!user) throw new NotFoundException('User profile not found. Please re-login.');

    let authRecord = await this.prisma.userAuth.findUnique({ where: { userId: user.id } });
    
    if (!authRecord) {
       authRecord = await this.prisma.userAuth.create({
         data: {
           userId: user.id,
           phone: `auth0-${user.id}`, 
           password: 'AUTH0_USER_NO_PASSWORD',
         }
       });
    }

    const twoFactorSecret = this.twoFactorAuthService.generateSecret();
    
    await this.prisma.userAuth.update({
      where: { userId: user.id },
      data: { twoFactorSecret }
    });

    const otpAuthUrl = this.twoFactorAuthService.getAuthenticatorOtpAuthUrl(
      'HR-Helper', user.email, twoFactorSecret
    );
    
    return { qrCodeUrl: await this.twoFactorAuthService.generateQrCodeDataURL(otpAuthUrl) };
  }

  async turnOn2FAForAuth0User(authUser: any, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { auth0Id: authUser.auth0Id } });
    if (!user) throw new NotFoundException('User profile not found. Please re-login.');

    const authRecord = await this.prisma.userAuth.findUnique({ where: { userId: user.id } });

    if (!authRecord || !authRecord.twoFactorSecret) {
      throw new BadRequestException('2FA setup has not been initiated.');
    }

    if (!this.twoFactorAuthService.isTwoFactorCodeValid(code, authRecord)) {
      throw new UnauthorizedException('Invalid 2FA code. Please try again.');
    }

    await this.prisma.userAuth.update({
      where: { userId: user.id },
      data: { isTwoFactorEnabled: true }
    });

    return { message: 'Two-Factor Authentication successfully enabled.' };
  }

  async verify2FAForAuth0User(authUser: any, code: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { auth0Id: authUser.auth0Id } });
    if (!user) throw new NotFoundException('User not found');

    const authRecord = await this.prisma.userAuth.findUnique({ where: { userId: user.id } });

    if (!authRecord || !this.twoFactorAuthService.isTwoFactorCodeValid(code, authRecord)) {
      throw new UnauthorizedException('Invalid 2FA code.');
    }

    return { success: true };
  }
}