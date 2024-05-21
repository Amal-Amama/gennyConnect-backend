import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  TECHNICIAN = 'technician',
  MAINTENANCE_COMPANY = 'maintenance_company',
}

export enum InstitutionType {
  PHARMACY = 'Pharmacy',
  CLINIC = 'Clinic',
  LABORATORY = 'Laboratory',
  HOSPITAL = 'Hospital',
}
export enum UserStatut {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export interface AvailabilitySlot {
  start: Date;
  end: Date;
}

const passwordValidator = (value: string) => {
  // Vérifier la complexité du mot de passe
  if (!/\d/.test(value) || !/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
    throw new Error(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
    );
  }
  return true;
};
export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
    trim: true,
    validate: passwordValidator,
  })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    required: true,
  })
  role: UserRole[];

  // Champs spécifiques au client (institution medicale)
  @Prop()
  medicalInstitutionName?: string;

  @Prop()
  institutionType?: InstitutionType; // enum (pharmacie, clinique, laboratoire, hopital)

  @Prop()
  specialty?: string;

  // Champs spécifiques au technicien
  @Prop()
  yearsOfExperience?: number;

  @Prop()
  diplome?: string[];

  @Prop()
  certifications?: string[];

  @Prop()
  spokenLanguages?: string[]; // array of selected languages from a dropdown list

  @Prop()
  weeklyAvailability?: AvailabilitySlot[];

  @Prop()
  interventionLocation?: string; // optional

  @Prop()
  hourlyRate?: number;

  @Prop({ default: 0 }) // Score initialisé à 0
  score: number;

  // Champs spécifiques à l'entreprise de maintenance
  @Prop()
  companyName?: string;

  @Prop()
  activityField?: string;

  @Prop()
  logo?: string; // optional

  @Prop()
  statut?: UserStatut;

  @Prop()
  profilImage?: string;

  @Prop({ default: false })
  emailConfirmed?: boolean;
  @Prop()
  assignedRequestsToTech: any[] = [];
  @Prop()
  createdMaintenancesRequests: any[] = [];
  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
