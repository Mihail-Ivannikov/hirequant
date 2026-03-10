import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SetPinDto {
    @IsNotEmpty()
    @IsString()
    @Length(4, 4, { message: 'PIN must be 4 digits'})
    pin: string;
}