import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserSchema } from './schemas/user.schema';
import { JwtStrategy } from './strategies/strategy.service';
import { UserVerificationSchema } from './schemas/userVerification.schema';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileUploadService } from 'src/file_upload/file_upload.service';
import { MaintenanceRequestSchema } from 'src/maintenance-requests/schemas/maintenanceRequest.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserVerification', schema: UserVerificationSchema },
      { name: 'MaintenanceRequest', schema: MaintenanceRequestSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    JwtAuthGuard,
    AuthService,
    JwtStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    FileUploadService,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
