import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { TelegramModule } from '../telegram/telegram.module';
import { TwoFactorAuthService } from './2fa.service';

import { JwtStrategy } from './jwt.strategy';
import { JwtLocalStrategy } from './jwt-local.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TelegramModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => {
        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: parseInt(
              configService.get<string>('JWT_EXPIRATION_TIME', '3600'),
              10,
            ),
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    TwoFactorAuthService,
    JwtStrategy,
    JwtLocalStrategy,
  ],
  controllers: [AuthController],
  exports: [PassportModule],
})
export class AuthModule {}