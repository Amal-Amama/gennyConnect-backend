import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserVerificationSchema } from 'src/auth/schemas/userVerification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserVerification', schema: UserVerificationSchema },
    ]),
  ],
})
export class UserVerificationModule {}
