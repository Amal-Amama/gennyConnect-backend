import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// Enum pour les types de créateurs autorisés
// export enum CreatorType {
//   CLIENT = 'client',
// }
// Enum pour les priorités de la demande
export enum Priority {
  URGENT = 'urgent',
  NORMAL = 'normal',
  LOW = 'low',
}

// Enum pour les statuts de la demande
export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

// Enum pour les types de demande de maintenance
export enum MaintenanceRequestType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
}
@Schema({ timestamps: true })
export class MaintenanceRequest {
  @Prop()
  title: string;
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
  status: RequestStatus; //pending,in-progress,completed
  @Prop()
  requestType: MaintenanceRequestType; //preventive, corrective
  @Prop()
  AssignedTechnician: string;
  @Prop()
  maintenanceLocation: string;
}
export const MaintenanceRequestSchema =
  SchemaFactory.createForClass(MaintenanceRequest);
