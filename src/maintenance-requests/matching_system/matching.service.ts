import mongoose, { Model } from 'mongoose';
import { User, UserRole } from 'src/auth/schemas/user.schema';
import { TechLocation } from './location.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MaintenanceRequest } from '../schemas/maintenanceRequest.schema';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class MatchingService {
  constructor(
    @InjectModel(User.name) // Injectez le modèle User
    private userModel: mongoose.Model<User>,
    private readonly locationService: TechLocation,
    private readonly mailerService: MailerService,
  ) {}

  async matchTechnicians(
    clientLanguages: string[],
    maintenanceRequest: MaintenanceRequest,
  ): Promise<User[]> {
    const technicians = await this.userModel.find({
      role: UserRole.TECHNICIAN,
      emailConfirmed: true,
      //  refreshToken: null,
    });
    if (!technicians || technicians.length === 0) {
      throw new NotFoundException("Can't find any technicians");
    }
    //  console.log(technicians);
    //console.log({ lengthListTech: technicians.length });

    const matchingTechAndMaintenance = technicians.filter(
      async (technician) => {
        // Étape 1: Vérifier si au moins une langue est partagée
        const sharedLanguage = clientLanguages.some((language) =>
          technician.spokenLanguages.includes(language),
        );
        if (!sharedLanguage) {
          console.log('Technician and client cannot communicate together');
          return false;
        }
        // Étape 2: Calculer la distance et filtrer les technicans
        const locationTech = technician.location;
        // const techCoordinates =await this.locationService.getCoordsForAddress(locationTech);
        // console.log({ techCoordinates });

        const maintenanceLocation = maintenanceRequest.maintenanceLocation;
        if (!maintenanceLocation) {
          return null;
        }

        //  const maintenanceCoordinates =await this.locationService.getCoordsForAddress(maintenanceLocation);
        //  console.log({ coordinatesMaintenace: maintenanceCoordinates });

        const distance = await this.locationService.calculateDistance(
          locationTech,
          maintenanceLocation,
        );
        console.log({ distance: distance });

        if (distance < 30) {
          technician.assignedRequestsToTech.push(maintenanceRequest);
          await technician.save();
          if (technician.refreshToken === null) {
            await this.mailerService.sendMailNotifForTech(
              technician.email,
              technician.firstName,
              technician.role,
            );
          }
        } else {
          console.log(
            'This request is not suitable for none of our technicians',
          );
        }
      },
    );
    return await Promise.all(
      matchingTechAndMaintenance.map((technician) => technician.save()),
    );
  }
}
