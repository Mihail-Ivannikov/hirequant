import { IsNotEmpty, IsPhoneNumber, IsString, Length, MinLength } from 'class-validator';

export class RecoverCompleteDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  pin: string;
  
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}