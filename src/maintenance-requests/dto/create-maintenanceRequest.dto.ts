import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  Priority,
  RequestStatus,
  MaintenanceRequestType,
} from '../schemas/maintenanceRequest.schema';
import { Optional } from '@nestjs/common';
import { User } from 'src/auth/schemas/user.schema';
export class CreateMaintenaceRequestDTO {
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsOptional()
  image: string;
  @IsNotEmpty()
  provider: string;
  @IsNotEmpty()
  deviceName: string;
  @IsNotEmpty()
  deviceSerialNumber: string;
  @IsNotEmpty()
  deviceBrand: string;
  @IsNotEmpty()
  deviceModel: string;
  @IsEnum(Priority, { message: 'please choose the priority' })
  @IsNotEmpty()
  priority: Priority;

  @Optional()
  status?: RequestStatus;

  @IsEnum(MaintenanceRequestType, {
    message: 'please choose a request type',
  })
  @IsNotEmpty()
  requestType: MaintenanceRequestType;
  @IsNotEmpty()
  maintenanceLocation: string;
  // creator: string;
  creator: User;
}
