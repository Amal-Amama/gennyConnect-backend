import {
  SubscribeMessage,
  OnGatewayConnection,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Message } from '../messages/schemas/message.schema';
import { WsJwtGuard } from 'src/auth/guards/jwt-ws.guard';

@WebSocketGateway(5000, { cors: { origin: '*' } })
@UseGuards(WsJwtGuard) // Application globale du WebSocket JWT Guard
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): Promise<string> {
    // Gestion de l'événement 'create_message'
    Logger.log('Message received:', payload);
    // Envoyer une réponse au client
    return 'Message received';
  }

  createMessage(message: Message) {
    this.server.emit('newMessage', message);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    Logger.log(`Client connected: ${client.id}`);
    Logger.log('Connection arguments:', args);
  }
}
