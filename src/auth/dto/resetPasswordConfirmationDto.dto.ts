import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordConfirmationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  code: string;
}
