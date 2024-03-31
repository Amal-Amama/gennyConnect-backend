import { IsOptional, IsString } from 'class-validator';
import {
  Priority,
  RequestStatus,
  MaintenanceRequestType,
} from '../schemas/maintenanceRequest.schema';
export class UpdateMaintenanceRequestDTO {
  @IsOptional()
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @IsString()
  provider: string;
  @IsOptional()
  @IsString()
  deviceName: string;
  @IsOptional()
  @IsString()
  deviceSerialNumber: string;
  @IsOptional()
  @IsString()
  deviceBrand: string;
  @IsOptional()
  @IsString()
  deviceModel: string;
}
