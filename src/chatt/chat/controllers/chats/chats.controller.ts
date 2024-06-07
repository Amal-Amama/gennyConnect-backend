import { CreateChatDto } from './../../dto/create-chat.dto';

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

import { ObjectId } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChatsService } from '../../services/chats/chats.service';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('create-chat')
  async createChat(@Body() createChatDto: CreateChatDto) {
    return await this.chatsService.createChat(createChatDto);
  }

  @Get('findOne/:id') // Corrected parameter decorator
  async getChatById(@Param('id') id: ObjectId) {
    // Corrected method name
    return await this.chatsService.findChatById(id);
  }

  @Get('messages/:id')
  async getAllChatsByUserId(@Param('id') id: ObjectId, @Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', ''); // Extract the token from Authorization header
    if (!token) {
      throw new Error('Authorization token is missing');
    }

    return await this.chatsService.findChatByMembersIds(token, id);
  }

  @Get('oneChat/:id')
  async getOneChatByMembersId(@Param('id') id: ObjectId, @Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', ''); // Extract the token from Authorization header
    if (!token) {
      throw new Error('Authorization token is missing');
    }

    return await this.chatsService.findOneChatByMembersIds(token, id);
  }

  @Get('history') // Corrected parameter decorator
  async getUserChatHistory(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', ''); // Extract the token from Authorization header
    if (!token) {
      throw new Error('Authorization token is missing');
    }
    return await this.chatsService.findChatHistoryById(token);
  }

  // @Get('lastMessage/:receiverId/:senderId')
  //   async getLastMessaage(@Param("receiverId") receiver_id, @Param("senderId") sender_id){
  //     return this.chatsService.getLastMessageInChat(receiver_id,sender_id)
  //   }

  // @Get('last-messages')
  // async getChatsWithLastMessages(@Req() req): Promise<any[]> {
  //   return this.chatsService.getChatsWithLastMessage();
  // }
}
