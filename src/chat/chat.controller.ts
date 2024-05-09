import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Roles } from 'src/auth/config/decorator/roles.decorator';
import { UserRole } from 'src/auth/schemas/user.schema';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateConversationDto } from './dtos/CreateConversationDTO.dto';
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    _id?: string;
    id?: string;
  };
}
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':mid')
  @Roles(UserRole.CLIENT)
  async getTechniciansForMaintenance(
    @Req() req: AuthRequest,
    @Param('mid') maintenaceId: string,
  ) {
    const clientId = req.user._id;
    return await this.chatService.getTechnicians(clientId, maintenaceId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/conversation/:mid/:tech')
  @Roles(UserRole.CLIENT)
  async sendMessageToTechnician(
    @Req() req: AuthRequest,
    @Param('mid') maintenaceId: string,
    @Param('tech') technicianId: string,
    @Body() conversationData: CreateConversationDto,
  ) {
    const clientId = req.user._id;
    return await this.chatService.createConversation(
      clientId,
      maintenaceId,
      technicianId,
      conversationData,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Post('/:cid/:rId')
  @Roles(UserRole.CLIENT || UserRole.TECHNICIAN)
  async sendMessage(
    @Req() req: AuthRequest,
    @Param('cid') conversationId: string,
    @Param(':rId') receivedId: string,
    @Body() messageData: CreateConversationDto,
  ) {
    const senderId = req.user._id;
    return this.chatService.sendMessage(
      senderId,
      conversationId,
      receivedId,
      messageData,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('/:cid/messages')
  @Roles(UserRole.CLIENT || UserRole.TECHNICIAN)
  async getMessages(
    @Req() req: AuthRequest,
    @Param('cid') conversationId: string,
  ) {
    const userId = req.user._id;
    return await this.chatService.getMessages(userId, conversationId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/conversations')
  @Roles(UserRole.CLIENT || UserRole.TECHNICIAN)
  async getConversations(@Req() req: AuthRequest) {
    const userId = req.user._id;
    return await this.chatService.getConversations(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('active')
  @Roles(UserRole.CLIENT || UserRole.TECHNICIAN)
  async getActiveUsers() {
    return this.chatService.getActiveUsers();
  }
  @UseGuards(JwtAuthGuard)
  @Get('inactive')
  @Roles(UserRole.CLIENT || UserRole.TECHNICIAN)
  async getInactiveUsers() {
    return this.chatService.getInactiveUsers();
  }
}
