import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class RegisterStartDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}