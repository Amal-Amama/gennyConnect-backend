import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  MaintenanceRequest,
  RequestStatus,
} from './schemas/maintenanceRequest.schema';
import mongoose, { Types } from 'mongoose';
import { Query } from 'express-serve-static-core';
import { User } from 'src/auth/schemas/user.schema';
import { TechLocation } from './matching_system/location.service';
import { UserRole } from '../auth/schemas/user.schema';
import { MatchingService } from './matching_system/matching.service';
import { MailerService } from 'src/mailer/mailer.service';
import { FileUploadService } from 'src/file_upload/file_upload.service';

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
    private readonly fileUploadService: FileUploadService,
  ) {}

  async findAll(
    skip: number,
    limit: number,
    filters: any,
  ): Promise<{ data: MaintenanceRequest[]; total: number }> {
    const query = {};

    if (filters.priority) {
      query['priority'] = filters.priority;
    }
    if (filters.location) {
      query['maintenanceLocation'] = {
        $regex: filters.location,
        $options: 'i',
      };
    }
    if (filters.deviceName) {
      query['deviceName'] = { $regex: filters.deviceName, $options: 'i' };
    }
    if (filters.creator) {
      // Extrayez le nom complet du créateur
      const creatorName = filters.creator.toLowerCase();
      // Utilisez une requête OR pour rechercher le nom complet du créateur
      query['$or'] = [
        { 'creator.firstName': { $regex: creatorName, $options: 'i' } },
        { 'creator.lastName': { $regex: creatorName, $options: 'i' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.maintenanceRequestModel
        .find(query)
        .populate('creator')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.maintenanceRequestModel.countDocuments(query).exec(),
    ]);

    return { data, total };
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
    const resPerPage = 3;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const filter = {
      creator: userId,
    };
    if (query.deviceName) {
      filter['deviceName'] = { $regex: query.deviceName, $options: 'i' };
    }
    if (query.priority) {
      filter['priority'] = query.priority;
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
  async create(userId: string, maintenanceRequestData, imagePath: string) {
    console.log(userId);
    let user;
    try {
      user = await this.userModel.findById(userId);
      console.log(user);
    } catch (err) {
      throw new HttpException(
        'Failed, please try again laterrrr!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const createdMaintenanceRequest = new this.maintenanceRequestModel({
      ...maintenanceRequestData,
      creator: userId,
      image: imagePath,
      status: RequestStatus.PENDING,
    });
    const clientSpokenLanguages = user.spokenLanguages;
    await this.machingService.matchTechnicians(
      clientSpokenLanguages,
      createdMaintenanceRequest,
    );
    try {
      await Promise.all([
        createdMaintenanceRequest.save(),
        user.createdMaintenancesRequests.push(createdMaintenanceRequest._id),
        user.save(),
      ]);
    } catch (err) {
      console.log(err);
      if (imagePath) this.fileUploadService.deleteFile(imagePath);
      throw new HttpException(
        'failed, please try again later!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      message: 'MaintenanceRequest Successfully Created',
      createdMaintenanceRequest: createdMaintenanceRequest.toObject({
        getters: true,
      }),
    };
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
  ) {
    const allowedFields = [
      'description',
      'provider',
      'deviceSerialNumber',
      'deviceBrand',
      'deviceModel',
    ];

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
    const updatedRequest = await this.maintenanceRequestModel
      .findOneAndUpdate({ _id: id, creator: userId }, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedRequest) {
      throw new NotFoundException('Maintenance request not found');
    }

    return { message: 'Request Updated Successfully!' };
  }

  async deleteById(id: string, userId: string) {
    const maintenanceRequest = await this.maintenanceRequestModel
      .findOneAndDelete({
        _id: id,
        creator: userId,
      })
      .exec();

    if (!maintenanceRequest) {
      throw new NotFoundException('Could not find MaintenanceRequest!');
    }

    const mid = new mongoose.Types.ObjectId(id);
    console.log(mid);
    // Retirer la maintenance request de la liste des créées par le client
    await this.userModel
      .findByIdAndUpdate(userId, {
        $pull: { createdMaintenancesRequests: mid },
      })
      .exec();

    // Retirer la maintenance request des listes des techniciens
    await this.userModel
      .updateMany(
        { role: UserRole.TECHNICIAN },
        { $pull: { assignedRequestsToTech: mid } },
      )
      .exec();

    return { message: 'Request deleted successfully!' };
  }

  // async getNearbyMaintenance(
  //   technicianId: string,
  //   query: Query,
  // ): Promise<MaintenanceRequest[]> {
  //   const resPerPage = 3;
  //   const currentPage = Number(query.page) || 1;
  //   const skip = resPerPage * (currentPage - 1);
  //   const technician = await this.userModel.findById(technicianId);
  //   if (!technician) {
  //     throw new Error('Technician not found');
  //   }
  //   const assignedMaintenanceIds = technician.assignedRequestsToTech;
  //   const maintenanceRequests = await this.maintenanceRequestModel
  //     .find({
  //       _id: { $in: assignedMaintenanceIds },
  //     })
  //     .skip(skip)
  //     .limit(resPerPage)
  //     .exec();

  //   return maintenanceRequests;
  // }
  async getNearbyMaintenance(
    technicianId: string,
    query: any,
  ): Promise<MaintenanceRequest[]> {
    const resPerPage = 3;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const technician = await this.userModel.findById(technicianId);
    if (!technician) {
      throw new Error('Technician not found');
    }
    const assignedMaintenanceIds = technician.assignedRequestsToTech;

    const filter: any = {
      _id: { $in: assignedMaintenanceIds },
    };

    if (query.deviceName) {
      filter['deviceName'] = { $regex: query.deviceName, $options: 'i' };
    }
    if (query.priority) {
      filter['priority'] = query.priority;
    }
    const maintenanceRequests = await this.maintenanceRequestModel
      .find(filter)
      .skip(skip)
      .limit(resPerPage)
      .exec();

    return maintenanceRequests;
  }

  async acceptMaintenance(maintenanceId: string, TechId: string) {
    const maintenance =
      await this.maintenanceRequestModel.findById(maintenanceId);
    if (!maintenance) {
      throw new NotFoundException('maintenace with this id not found');
    }

    const tech = await this.userModel.findById(TechId);
    if (!tech) {
      throw new NotFoundException('technicien with the specific id not found');
    }
    maintenance.status = RequestStatus.ACCEPTED;
    const technicianId = new Types.ObjectId(TechId);
    maintenance.AcceptedBy.push(technicianId);

    await maintenance.save();
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
    return {
      maintenance: maintenance,
      message:
        'you accept this work , please wait for message from our client!',
    };
  }
  async acceptVerification(maintenanceId: string, TechId: string) {
    const maintenance =
      await this.maintenanceRequestModel.findById(maintenanceId);
    if (!maintenance) {
      throw new NotFoundException('maintenace with this id not found');
    }

    const tech = await this.userModel.findById(TechId);
    if (!tech) {
      throw new NotFoundException('technicien with the specific id not found');
    }
    const technicianId = new Types.ObjectId(TechId);
    if (
      maintenance.AcceptedBy.includes(technicianId) &&
      maintenance.status === RequestStatus.ACCEPTED
    ) {
      return {
        message:
          "You have accepted this maintenance request,Please,wait for client's response",
      };
    } else {
      return null;
    }
  }
  async rejectMaintenance(techId: string, maintenanceId: string) {
    const maintenance = await this.maintenanceRequestModel
      .findById(maintenanceId)
      .exec();

    if (!maintenance) {
      throw new NotFoundException('Maintenance request not found');
    }
    const technician = await this.userModel.findById(techId);
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }
    if (
      !technician.assignedRequestsToTech.includes(
        new Types.ObjectId(maintenanceId),
      )
    ) {
      throw new BadRequestException(
        'Maintenance request is not assigned to this technician',
      );
    }
    technician.assignedRequestsToTech =
      technician.assignedRequestsToTech.filter(
        (id) => id.toString() !== maintenanceId,
      );
    await technician.save();
    return { message: 'Maintenance rejected' };
  }
  async technicansAcceptMaintenance(
    id: string,
    userId: string,
  ): Promise<User[]> {
    let maintenanceRequest;
    try {
      maintenanceRequest = await this.maintenanceRequestModel
        .findOne({ _id: id, creator: userId })
        .exec();
    } catch (error) {
      throw new NotFoundException('Could not find maintenanceRequest');
    }
    const maintenance = await this.maintenanceRequestModel
      .findById(id)
      .populate({ path: 'AcceptedBy', model: 'User' })
      .exec();
    console.log(maintenance);

    if (!maintenance) {
      throw new NotFoundException('Maintenance request not found');
    }
    return maintenance.AcceptedBy as unknown as User[];
  }
}
