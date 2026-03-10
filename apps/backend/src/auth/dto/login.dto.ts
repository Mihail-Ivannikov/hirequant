import { IsNotEmpty, IsPhoneNumber, IsString, MinLength, IsOptional, Length } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  twoFactorCode?: string;
}