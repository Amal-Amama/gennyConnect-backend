import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserStatut } from 'src/auth/schemas/user.schema';
import { MaintenanceRequest } from 'src/maintenance-requests/schemas/maintenanceRequest.schema';
import { Conversation } from './schemas/conversation.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(MaintenanceRequest.name)
    private maintenanceRequestModel: Model<MaintenanceRequest>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}

  async getTechnicians(clientId: string, maintenanceId: string) {
    const [client, maintenance] = await Promise.all([
      this.userModel.findById(clientId),
      this.maintenanceRequestModel.findById(maintenanceId).populate('creator'),
    ]);

    if (!client || !maintenance) {
      throw new NotFoundException(
        'Client or maintenance with that id not found!',
      );
    }

    return clientId === maintenance.creator._id.toString()
      ? maintenance.AcceptedBy
      : [];
  }

  async createConversation(
    clientId: string,
    maintenanceId: string,
    technicianId: string,
    conversationData: any,
  ) {
    const technicians = await this.getTechnicians(clientId, maintenanceId);
    const technician = technicians.find(
      (tech) => tech._id.toString() === technicianId,
    );

    if (!technician) {
      throw new NotFoundException(
        'Technician not found or not assigned to this maintenance',
      );
    }

    const createdConversation = new this.conversationModel({
      ...conversationData,
      senderId: clientId,
      receivedId: technicianId,
    });

    await createdConversation.save();
    return createdConversation;
  }

  async sendMessage(
    senderId: string,
    conversationId: string,
    receivedId: string,
    messageData: any,
  ) {
    const [user, conversation] = await Promise.all([
      this.userModel.findById(senderId),
      this.conversationModel.findById(conversationId),
    ]);

    if (!user || !conversation) {
      throw new NotFoundException('User or conversation not found');
    }

    const newMessage = {
      ...messageData,
      senderId: senderId,
      createdAt: Date.now(),
      visible: false,
    };

    conversation.messages.push(newMessage);
    await conversation.save();
    return conversation;
  }

  async getMessages(userId: string, conversationId: string) {
    const [user, conversation] = await Promise.all([
      this.userModel.findById(userId),
      this.conversationModel.findById(conversationId),
    ]);

    if (!user || !conversation) {
      throw new NotFoundException('User or conversation not found');
    }

    if (
      userId === conversation.senderId ||
      userId === conversation.receivedId
    ) {
      conversation.messages.forEach((message) => {
        if (message.senderId !== userId) {
          message.visible = true;
        }
      });

      await conversation.save();
      console.log('This user participates in this conversation');
      return conversation.messages;
    } else {
      throw new NotFoundException('User not authorized to view these messages');
    }
  }

  async getConversations(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const conversations = await this.conversationModel.find({
      $or: [{ senderId: userId }, { receivedId: userId }],
    });

    return conversations;
  }

  async getActiveUsers() {
    return this.userModel.find({ status: UserStatut.ONLINE }).exec();
  }

  async getInactiveUsers() {
    return this.userModel.find({ status: UserStatut.OFFLINE }).exec();
  }
}
