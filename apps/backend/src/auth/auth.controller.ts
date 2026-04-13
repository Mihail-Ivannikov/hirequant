import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterStartDto } from './dto/register-start.dto';
import { RegisterCompleteDto } from './dto/register-complete.dto';
import { Enable2faDto } from './dto/enable-2fa.dto';
import { LoginDto } from './dto/login.dto';
import { SetPinDto } from './dto/set-pin.dto';
import { JwtLocalAuthGuard } from './jwt-local-auth.guard';
import { RecoverCompleteDto } from './dto/recover-complete.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/start')
  @HttpCode(HttpStatus.OK)
  async registerStart(@Body() body: RegisterStartDto) {
    return this.authService.registerStart(body.phone);
  }

  @Post('register/complete')
  async registerComplete(@Body() body: RegisterCompleteDto) {
    return this.authService.registerComplete(
      body.phone, 
      body.otp, 
      body.password, 
      body.role, 
      body.companyName
    );
  }

  @Post('register/enable-2fa')
  @HttpCode(HttpStatus.OK)
  async enable2fa(@Body() body: Enable2faDto) {
    return this.authService.enableTwoFactorAuth(body.phone, body.twoFactorCode);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.phone, body.password, body.twoFactorCode);
  }

  @UseGuards(JwtLocalAuthGuard)
  @Post('pin/set')
  @HttpCode(HttpStatus.OK)
  async setPin(@Req() req, @Body() body: SetPinDto) {
    return this.authService.setPin(req.user.id, body.pin);
  }

  @Post('recover/start')
  @HttpCode(HttpStatus.OK)
  async recoverStart(@Body() body: RegisterStartDto) {
    return this.authService.recoverStart(body.phone);
  }

  @Post('recover/complete')
  @HttpCode(HttpStatus.OK)
  async recoverComplete(@Body() body: RecoverCompleteDto) {
    return this.authService.recoverComplete(body.phone, body.otp, body.pin, body.newPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('sync')
  async syncUser(
    @Req() req,
    @Body('role') role?: string,
    @Body('companyName') companyName?: string
  ) {
    return this.authService.syncUser(req.user, role, companyName);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/generate')
  @HttpCode(HttpStatus.OK)
  async generate2FA(@Req() req) {
    return this.authService.generate2FAForAuth0User(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/turn-on')
  @HttpCode(HttpStatus.OK)
  async turnOn2FA(@Req() req, @Body('code') code: string) {
    return this.authService.turnOn2FAForAuth0User(req.user, code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verify2FA(@Req() req, @Body('code') code: string) {
    return this.authService.verify2FAForAuth0User(req.user, code);
  }
}