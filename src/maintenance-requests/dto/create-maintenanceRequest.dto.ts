import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  Priority,
  RequestStatus,
  MaintenanceRequestType,
} from '../schemas/maintenanceRequest.schema';
export class CreateMaintenaceRequestDTO {
  @IsNotEmpty()
  @IsString()
  title: string;
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
  @IsEnum(RequestStatus, { message: 'please choose a status' })
  @IsNotEmpty()
  status: RequestStatus;
  @IsEnum(MaintenanceRequestType, {
    message: 'please choose a request type',
  })
  @IsNotEmpty()
  requestType: MaintenanceRequestType;
  @IsNotEmpty()
  maintenanceLocation: string;
  creator: string;
}
