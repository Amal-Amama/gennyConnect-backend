import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { ObjectId } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-message')
  @ApiResponse({
    status: 201,
    description: 'The message has been successfully created.',
  })
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return await this.messagesService.createMessage(createMessageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAllMessagesByChatId(
    @Param('id') id: ObjectId,
    @Req() req,
  ): Promise<any> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', ''); // Extract the token from Authorization header
      if (!token) {
        throw new Error('Authorization token is missing');
      }
      console.log('Request Headers:', req.headers);
      console.log('Token:', req.headers.authorization);

      return await this.messagesService.findAllMessages(token, id);
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }
}
