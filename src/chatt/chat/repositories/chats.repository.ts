import { Chat } from './../schema/chat.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
  Message,
  MessageDocument,
} from 'src/chatt/messages/schemas/message.schema';
import { UserService } from 'src/users/user.service';

export class ChatsRepository {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel('Chat')
    private chatModel: Model<Chat>,
    private userService: UserService,
  ) {}

  async createChat(chat): Promise<any> {
    const createOne = await this.chatModel.create(chat);
    return createOne;
  }

  async findChatById(id: ObjectId): Promise<Chat | null> {
    const chat = await this.chatModel.findById(id).exec();
    return chat;
  }

  async findChatByMembersIds(id, id2): Promise<any> {
    const findAll = await this.chatModel.find({ members: { $all: [id, id2] } });
    return findAll;
  }

  async findCurrentUserChatList(id): Promise<any> {
    const currentUserChats = await this.chatModel.find({ members: id }).exec();

    const chatsOutput = [];
    for (const chat of currentUserChats) {
      if (chat.members.length < 2) {
        continue;
      }

      const otherUserId = chat.members.find(
        (memberId) => memberId.toString() !== id,
      );
      const otherUserIdString = otherUserId.toString();
      const user = await this.userService.findOneUser(otherUserIdString);

      const chatWithUser = { ...chat.toObject(), user };
      chatsOutput.push(chatWithUser);
    }

    return chatsOutput;
  }

  async findAllChatsWithLastMessage(): Promise<any[]> {
    const chats = await this.chatModel.find().exec();
    const chatsWithLastMessages = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await this.messageModel
          .findOne({ chat_id: chat._id })
          .sort({ createdAt: -1 })
          .limit(1)
          .exec();

        return {
          ...chat.toObject(),
          lastMessage: lastMessage ? lastMessage.message : null,
        };
      }),
    );

    return chatsWithLastMessages;
  }
}
