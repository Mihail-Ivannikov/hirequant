import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('sync')
  async syncUser(@Req() req) {
    // req.user comes from JwtStrategy
    return this.authService.syncUser(req.user);
  }
}