import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDemandDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
