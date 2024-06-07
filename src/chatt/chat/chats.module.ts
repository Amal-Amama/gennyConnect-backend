import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsController } from './controllers/chats/chats.controller';
import { ChatsService } from './services/chats/chats.service';
import { ChatsRepository } from './repositories/chats.repository';
import { JwtService } from '@nestjs/jwt';
import { Chat, ChatSchema } from './schema/chat.schema';
import { Message, MessageSchema } from '../messages/schemas/message.schema';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UserModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsRepository, JwtService],
  exports: [ChatsService, ChatsRepository],
})
export class ChatsModule {}
