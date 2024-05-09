import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
  createdAt: Date;
  visible: boolean;
}
