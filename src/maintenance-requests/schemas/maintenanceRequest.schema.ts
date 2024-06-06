import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

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
  // @Prop()
  // creator: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator: User;
  @Prop()
  image: string;
  @Prop()
  provider: string;
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
  status?: RequestStatus; //accepted,pending,in-progress,completed
  @Prop()
  requestType: MaintenanceRequestType; //preventive, corrective
  // @Prop()
  // AcceptedBy: any[] = [];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  AcceptedBy: Types.ObjectId[];

  @Prop()
  maintenanceLocation: string;
  _id: any;
  // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // TechnicianId: User;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  Historics: Types.ObjectId[];
}
export const MaintenanceRequestSchema =
  SchemaFactory.createForClass(MaintenanceRequest);
