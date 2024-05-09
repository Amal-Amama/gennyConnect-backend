import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<Conversation>;
@Schema({ timestamps: true })
export class Conversation {
  @Prop()
  senderId: string;

  @Prop()
  receivedId: string;

  @Prop()
  messages: {
    senderId: string;
    message: string;
    createdAt: Date;
    visible: boolean;
  }[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
