import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<UserVerification>;
@Schema({ timestamps: true })
export class UserVerification {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  uniqueString: string;

  @Prop()
  createdAt: Date;

  @Prop()
  expireAt: Date;
}

export const UserVerificationSchema =
  SchemaFactory.createForClass(UserVerification);
