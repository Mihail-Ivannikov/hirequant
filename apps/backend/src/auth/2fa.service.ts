import { Injectable } from '@nestjs/common';
import { toDataURL } from 'qrcode';
import { UserAuth } from '@prisma/client';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TwoFactorAuthService {
  
  public generateSecret(): string {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.base32;
  }

  public async generateQrCodeDataURL(otpAuthUrl: string): Promise<string> {
    return toDataURL(otpAuthUrl);
  }

  public getAuthenticatorOtpAuthUrl(
    serviceName: string,
    accountName: string,
    secret: string,
  ): string {
    return speakeasy.otpauthURL({
      secret: secret,
      label: accountName,
      issuer: serviceName,
      encoding: 'base32',
    });
  }

  public isTwoFactorCodeValid(
    twoFactorCode: string,
    userAuth: UserAuth,
  ): boolean {
    if (!userAuth.twoFactorSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: userAuth.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 1,
    });
  }
}