import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  MaintenanceRequest,
  RequestStatus,
} from './schemas/maintenanceRequest.schema';
import mongoose from 'mongoose';
import { Query } from 'express-serve-static-core';
import { User } from 'src/auth/schemas/user.schema';
import { TechLocation } from './matching_system/location.service';
import { UserRole } from '../auth/schemas/user.schema';
import { MatchingService } from './matching_system/matching.service';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class MaintenanceRequestsService {
  constructor(
    @InjectModel(MaintenanceRequest.name)
    private maintenanceRequestModel: mongoose.Model<MaintenanceRequest>,
    @InjectModel(User.name) // Injectez le modèle User
    private userModel: mongoose.Model<User>,
    private readonly locationService: TechLocation,
    private readonly machingService: MatchingService,
    private readonly mailerService: MailerService,
  ) {}

  async getAllMaintenanceRequests() {
    return this.maintenanceRequestModel.find();
  }
  async findRequestsByUserIdforAdmin(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return await this.maintenanceRequestModel.find({ creator: userId }).exec();
  }

  async findAllUserRequests(
    userId: string,
    query: Query,
  ): Promise<MaintenanceRequest[]> {
    const resPerPage = 8;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const filter = {
      creator: userId, // Filtrer par l'ID de l'utilisateur
    };
    if (query.deviceName) {
      filter['deviceName'] = { $regex: query.deviceName, $options: 'i' }; // Recherche par nom d'appareil (insensible à la casse)
    }
    if (query.priority) {
      filter['priority'] = query.priority; // Ajouter un filtre pour la priorité
    }
    try {
      const maintenanceRequests = await this.maintenanceRequestModel
        .find(filter)
        .limit(resPerPage)
        .skip(skip);
      return maintenanceRequests;
    } catch (error) {
      if (error.status === 403) {
        throw new ForbiddenException("you can't access to this ressource");
      }
    }
  }
  async create(
    userId: string,
    maintenanceRequestData,
    imagePath: string,
  ): Promise<MaintenanceRequest> {
    //creation de demande de maintenace
    const user = await this.userModel.findOne({
      _id: userId,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const createdMaintenanceRequest = new this.maintenanceRequestModel({
      ...maintenanceRequestData,
      creator: userId,
      image: imagePath,
    });
    const clientSpokenLanguages = user.spokenLanguages;
    await this.machingService.matchTechnicians(
      clientSpokenLanguages,
      createdMaintenanceRequest,
    );

    return await createdMaintenanceRequest.save();
  }
  async findSingleMaintenanceRequest(
    id: string,
    userId: string,
  ): Promise<MaintenanceRequest> {
    let maintenanceRequest;
    try {
      maintenanceRequest = await this.maintenanceRequestModel
        .findOne({ _id: id, creator: userId }) // Ajouter la vérification du créateur de la demande
        .exec();
    } catch (error) {
      throw new NotFoundException('Could not find maintenanceRequest');
    }
    if (!maintenanceRequest) {
      throw new NotFoundException('Could not find maintenanceRequest');
    }
    return maintenanceRequest;
  }

  async updateMaintenanceRequest(
    id: string,
    userId: string,
    maintenanceRequestData,
  ): Promise<MaintenanceRequest> {
    let maintenanceRequest;
    const allowedFields = [
      'description',
      'provider',
      'deviceSerialNumber',
      'deviceBrand',
      'deviceModel',
    ];
    try {
      maintenanceRequest = await this.maintenanceRequestModel.findOne({
        _id: id,
        creator: userId,
      });
    } catch (error) {
      throw new NotFoundException('Could not find maintenanceRequest');
    }
    if (!maintenanceRequest) {
      throw new NotFoundException('Maintenance request not found');
    }
    const updateData = {};
    for (const key of Object.keys(maintenanceRequestData)) {
      if (allowedFields.includes(key)) {
        updateData[key] = maintenanceRequestData[key];
      } else {
        throw new BadRequestException(
          `Field '${key}' is not allowed for update by clients`,
        );
      }
    }
    return await this.maintenanceRequestModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();
  }
  async deleteById(id: string, userId: string): Promise<MaintenanceRequest> {
    let maintenanceRequest;
    try {
      maintenanceRequest = await this.maintenanceRequestModel.findOne({
        _id: id,
        creator: userId,
      });
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
    if (!maintenanceRequest) {
      throw new NotFoundException('Could not find MaintenanceRequest!');
    }
    return await this.maintenanceRequestModel.findByIdAndDelete(id);
  }
  async getNearbyMaintenance(technicianId: string) {
    const technician = await this.userModel.findById(technicianId);
    if (!technician) {
      throw new Error('Technician not found');
    }
    return technician.assignedRequestsToTech;
  }
  async acceptMaintenance(maintenaceId: string, TechId: string) {
    const maintenance =
      await this.maintenanceRequestModel.findById(maintenaceId);
    if (!maintenance) {
      throw new NotFoundException('maintenace with this id not found');
    }
    maintenance.status = RequestStatus.ACCEPTED;
    const tech = await this.userModel.findById(TechId);
    if (!tech) {
      throw new NotFoundException('technicien with the specific id not found');
    }
    maintenance.AcceptedBy.push(tech);
    maintenance.save();
    const client = await this.userModel.findById(maintenance.creator);
    if (!client) {
      throw new NotFoundException('client not found');
    }
    if (client.refreshToken === null) {
      await this.mailerService.sendMailNotifForClient(
        client.email,
        client.firstName,
      );
    }

    return maintenance;
  }
  async rejectMaintenance(techId: string, maintenanceId: string) {
    const technician = await this.userModel.findById(techId);
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    const NewList = technician.assignedRequestsToTech.filter((m) => {
      return m._id.toString() !== maintenanceId;
    });
    technician.assignedRequestsToTech = NewList;
    await technician.save();
    return { message: 'Maintenance rejected' };
  }
  async technicansAcceptMaintenance(
    id: string,
    userId: string,
  ): Promise<MaintenanceRequest> {
    let maintenanceRequest;
    try {
      maintenanceRequest = await this.maintenanceRequestModel
        .findOne({ _id: id, creator: userId }) // Ajouter la vérification du créateur de la demande
        .exec();
    } catch (error) {
      throw new NotFoundException('Could not find maintenanceRequest');
    }
    if (!maintenanceRequest) {
      throw new NotFoundException('Could not find maintenanceRequest');
    }
    return maintenanceRequest.AcceptedBy;
  }
}
