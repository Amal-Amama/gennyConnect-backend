import { IsNotEmpty } from 'class-validator';

export class DeletAccountDto {
  @IsNotEmpty()
  password: string;
}
