import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum Priority {
  URGENT = 'urgent',
  NORMAL = 'normal',
  LOW = 'low',
}

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum MaintenanceRequestType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
}
@Schema({ timestamps: true })
export class MaintenanceRequest {
  @Prop()
  description: string;
  @Prop()
  creator: string;
  @Prop()
  image: string;
  @Prop()
  provider: string; //fournisseur
  @Prop()
  deviceName: string;
  @Prop()
  deviceSerialNumber: string;
  @Prop()
  deviceBrand: string;
  @Prop()
  deviceModel: string;
  @Prop()
  priority: Priority; //urgent,normal,low
  @Prop()
  status?: RequestStatus; //pending,in-progress,completed
  @Prop()
  requestType: MaintenanceRequestType; //preventive, corrective
  @Prop()
  AcceptedBy: any[] = [];
  @Prop()
  maintenanceLocation: string;
}
export const MaintenanceRequestSchema =
  SchemaFactory.createForClass(MaintenanceRequest);
