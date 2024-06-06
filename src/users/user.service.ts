import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from '../auth/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { MaintenanceRequest } from 'src/maintenance-requests/schemas/maintenanceRequest.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(MaintenanceRequest.name)
    private maintenanceRequestModel: Model<MaintenanceRequest>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
  async findByRole(): Promise<{
    clients: User[];
    technicians: User[];
    companies: User[];
  }> {
    const [clients, technicians, companies] = await Promise.all([
      this.userModel.find({ role: UserRole.CLIENT }).exec(),
      this.userModel.find({ role: UserRole.TECHNICIAN }).exec(),
      this.userModel.find({ role: UserRole.MAINTENANCE_COMPANY }).exec(),
    ]);

    return { clients, technicians, companies };
  }

  async findOneUser(userId: string): Promise<User> {
    return this.userModel.findById(userId).exec();
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let deleteOperations: Promise<any>[] = [];

    if (user.role === UserRole.CLIENT) {
      console.log({ normalId: userId });
      const userObjectId = new Types.ObjectId(userId);
      console.log({ ObjectId: userObjectId });
      const maintenanceRequests = await this.maintenanceRequestModel
        .find({ creator: userObjectId })
        .exec();

      if (maintenanceRequests.length > 0) {
        const maintenanceRequestIds = maintenanceRequests.map(
          (request) => request._id,
        );
        console.log(maintenanceRequestIds);

        const updateTechnicians = this.userModel
          .updateMany(
            { role: UserRole.TECHNICIAN },
            {
              $pull: { assignedRequestsToTech: { $in: maintenanceRequestIds } },
            },
          )
          .exec();

        const deleteMaintenanceRequests = this.maintenanceRequestModel
          .deleteMany({ creator: userObjectId })
          .exec();

        deleteOperations.push(updateTechnicians, deleteMaintenanceRequests);
      }
    } else if (user.role === UserRole.TECHNICIAN) {
      console.log({ normalId: userId });
      const userObjectId = new Types.ObjectId(userId);
      console.log({ ObjectId: userObjectId });
      const removeFromAcceptedBy = this.maintenanceRequestModel
        .updateMany(
          { AcceptedBy: userObjectId },
          { $pull: { AcceptedBy: userObjectId } },
        )
        .exec();

      deleteOperations.push(removeFromAcceptedBy);
    }

    await Promise.all(deleteOperations);

    await this.userModel.findByIdAndDelete(userId).exec();

    return { message: 'User and associated details deleted successfully! ' };
  }
}
