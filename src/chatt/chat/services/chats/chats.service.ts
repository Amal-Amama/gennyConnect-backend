import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

import { Chat, ChatDocument } from '../../schema/chat.schema';
import { ChatsRepository } from './../../repositories/chats.repository';
import { CreateChatDto } from './../../dto/create-chat.dto';
import {
  Message,
  MessageDocument,
} from 'src/chatt/messages/schemas/message.schema';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    private readonly chatsRepository: ChatsRepository,
    private readonly jwtService: JwtService,
  ) {}

  // The rest of your service methods

  async createChat(createChatDto: CreateChatDto) {
    return await this.chatsRepository.createChat(createChatDto);
  }

  async findChatById(chatId: ObjectId) {
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Find the last message for the chat
    const lastMessage = await this.messageModel
      .findOne({ chat_id: chat._id })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();

    return {
      ...chat.toObject(),
      lastMessage: lastMessage ? lastMessage.message : null,
    };
  }

  async findChatHistoryById(token: string): Promise<any> {
    const decodedToken = this.jwtService.decode(token) as { sub: ObjectId };
    return await this.chatsRepository.findCurrentUserChatList(decodedToken.sub);
  }

  async findOneChatByMembersIds(token: string, id: ObjectId) {
    const decodedToken = this.jwtService.decode(token) as { sub: ObjectId };
    return await this.chatsRepository.findChatByMembersIds(
      id,
      decodedToken.sub,
    );
  }

  async findChatByMembersIds(token: string, id: ObjectId) {
    const decodedToken = this.jwtService.decode(token) as { sub: ObjectId };

    return await this.chatsRepository
      .findChatByMembersIds(id, decodedToken.sub)
      .then((chat) => {
        if (chat[0] == null) {
          // If no chat exists between the members, create a new chat
          const chatDTO = new CreateChatDto();
          chatDTO.members = [];
          chatDTO.members.push(decodedToken.sub.toString());
          chatDTO.members.push(id.toString());

          // Create the chat
          return this.createChat(chatDTO).then((chat: any) => {
            // Find messages associated with the newly created chat
            return this.messageModel.find({ chat_id: chat.id }).exec();
          });
        }

        // If a chat already exists between the members, return messages associated with that chat
        return this.messageModel.find({ chat_id: chat[0].id }).exec();
      });
  }

  async getChatsWithLastMessage(): Promise<any[]> {
    const chats = await this.chatsRepository.findAllChatsWithLastMessage();
    return chats;
  }
}
