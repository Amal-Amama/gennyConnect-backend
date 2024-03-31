import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter correct email' })
  @IsNotEmpty()
  @MinLength(6)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
