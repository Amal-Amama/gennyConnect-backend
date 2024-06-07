import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Model, ObjectId } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

import { EventsGateway } from 'src/chatt/events/events.gateway';
import { ChatsService } from 'src/chatt/chat/services/chats/chats.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private eventGateway: EventsGateway,
    private jwtService: JwtService,
    private chatService: ChatsService,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const createdMessage = new this.messageModel({
      message: createMessageDto.message,
      sender_id: createMessageDto.sender_id,
      receiver_id: createMessageDto.receiver_id,
      chat_id: createMessageDto.chat_id,
    });

    const result = await createdMessage.save();
    this.eventGateway.createMessage(result); // Emit event
    return result;
  }

  async findAllMessages(token: string, chatId: ObjectId): Promise<Message[]> {
    try {
      const decodedToken = this.jwtService.decode(token) as { sub: ObjectId };
      console.log(decodedToken);

      if (!decodedToken || !decodedToken.sub) {
        throw new Error('Invalid token or missing user ID in token');
      }

      // Retrieve the chat by ID
      const chat = await this.chatService.findChatById(chatId);

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }

      // Check if the authenticated user is a member of the chat
      if (chat.members.includes(decodedToken.sub)) {
        // Fetch messages associated with the chat ID
        const messages = await this.messageModel
          .find({ chat_id: chatId })
          .exec();
        return messages;
      } else {
        throw new Error('User is not a member of this chat');
      }
    } catch (error) {
      throw new Error(`Failed to retrieve messages: ${error.message}`);
    }
  }
}
