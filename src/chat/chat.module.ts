// import { Module } from '@nestjs/common';
// import { ChatController } from './chat.controller';
// import { ChatService } from './chat.service';
// import { JwtModule } from '@nestjs/jwt';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UserSchema } from 'src/auth/schemas/user.schema';
// import { MaintenanceRequestSchema } from 'src/maintenance-requests/schemas/maintenanceRequest.schema';
// import { ConversationSchema } from './schemas/conversation.schema';
// @Module({
//   imports: [
//     JwtModule.register({}),
//     MongooseModule.forFeature([
//       { name: 'User', schema: UserSchema },
//       { name: 'MaintenanceRequest', schema: MaintenanceRequestSchema },
//       { name: 'Conversation', schema: ConversationSchema },
//     ]),
//   ],
//   controllers: [ChatController],
//   providers: [ChatService],
// })
// export class ChatModule {}
