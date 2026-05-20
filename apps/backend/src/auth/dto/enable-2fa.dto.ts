import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class Enable2faDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: '2FA code must be 6 digits' })
  twoFactorCode: string;
}