import {
  IsNumber,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { AvailabilitySlot } from '../schemas/user.schema';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  mobileNumber: number;

  // Champs spécifiques au technicien
  @IsNumber() // Valider un nombre
  @IsOptional() // Optionnel pour les rôles autres que "technicien"
  yearsOfExperience?: number;

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
}
