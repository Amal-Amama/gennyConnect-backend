import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import {
  AvailabilitySlot,
  InstitutionType,
  UserRole,
  UserStatut,
} from '../schemas/user.schema';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  mobileNumber: UserRole;

  @IsEnum(UserRole) // Valider le rôle par rapport à l'enum UserRole
  @IsNotEmpty()
  role: UserRole;

  // Champs spécifiques au client (institution medicale)
  @IsString()
  @IsOptional() // Optionnel pour les rôles autres que "client"
  medicalInstitutionName?: string;

  @IsEnum(InstitutionType) // Valider le type d'institution par rapport à l'enum InstitutionType
  @IsOptional() // Optionnel pour les rôles autres que "client"
  institutionType?: InstitutionType;

  @IsString()
  @IsOptional() // Optionnel pour les rôles autres que "client"
  specialty?: string;

  // Champs spécifiques au technicien
  // @IsNumber() // Valider un nombre
  @IsOptional() // Optionnel pour les rôles autres que "technicien"
  yearsOfExperience?: number;

  @IsString()
  @IsOptional() // Optionnel pour les rôles autres que "technicien"
  diplome?: string[];

  @IsString({ each: true }) // Valider chaque élément du tableau
  @IsOptional() // Optionnel pour les rôles autres que "technicien"
  certifications?: string[];

  @IsString({ each: true }) // Valider chaque élément du tableau
  @IsOptional() // Optionnel pour les rôles autres que "technicien"
  spokenLanguages?: string[];

  @ValidateNested() // Valider chaque élément du tableau
  @IsOptional() // Optionnel pour les rôles autres que "technicien"
  weeklyAvailability?: AvailabilitySlot[];

  @IsString()
  @IsOptional() // Optionnel pour les rôles autres que "technicien"
  interventionLocation?: string;

  @IsNumber() // Valider un nombre
  @IsOptional() // Optionnel pour les rôles autres que "technicien"
  hourlyRate?: number;

  // Champs spécifiques à l'entreprise de maintenance
  @IsString()
  @IsOptional() // Optionnel pour les rôles autres que "maintenance_company"
  companyName?: string;

  @IsString()
  @IsOptional()
  activityField?: string;

  @IsString()
  @IsOptional() // Optionnel pour les rôles autres que "maintenance_company"
  logo?: string;

  @IsString()
  @IsOptional()
  profilImage?: string;

  @IsOptional()
  score?: number;

  @IsEnum(UserStatut)
  @IsOptional()
  statut?: UserStatut;

  refreshToken: string;
}
