import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { Document, ObjectId } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ versionKey: false, timestamps: true })
export class Chat {
  @Prop({ ref: 'User', type: [SchemaTypes.ObjectId] })
  members: ObjectId[];

  @Prop({ type: Date, default: Date.now })
  lastUpdate: Date;

  @Prop({ type: [SchemaTypes.ObjectId], default: [] })
  readPersons: ObjectId[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: "Message", default: [] })
  lastMessage: ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
