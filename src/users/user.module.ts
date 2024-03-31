import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/schemas/user.schema';
import { MaintenanceRequestSchema } from 'src/maintenance-requests/schemas/maintenanceRequest.schema';
import { UserVerificationSchema } from 'src/auth/schemas/userVerification.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'MaintenanceRequest', schema: MaintenanceRequestSchema },
      { name: 'UserVerification', schema: UserVerificationSchema },
    ]),
  ],
  providers: [UserService, JwtService],
  controllers: [UserController],
})
export class UserModule {}
