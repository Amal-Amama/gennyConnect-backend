import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './controllers/messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';
import { EventsModule } from '../events/events.module';
import { JwtService } from '@nestjs/jwt';
import { ChatsModule } from '../chat/chats.module';
import { ChatsService } from '../chat/services/chats/chats.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    EventsModule,
    ChatsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, JwtService, ChatsService],
  exports: [MessagesService],
})
export class MessagesModule {}
