import { Module } from '@nestjs/common';
import { MaintenanceRequestsController } from './maintenance-requests.controller';
import { MaintenanceRequestsService } from './maintenance-requests.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MaintenanceRequestSchema } from './schemas/maintenanceRequest.schema';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from 'src/auth/schemas/user.schema';
import { FileUploadService } from 'src/file_upload/file_upload.service';
import { TechLocation } from './matching_system/location.service';
import { MatchingService } from './matching_system/matching.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'MaintenanceRequest', schema: MaintenanceRequestSchema },
      { name: 'User', schema: UserSchema },
    ]),
    JwtModule.register({
      //nzidha Async
      // inject: [ConfigService],
      // useFactory: async (config: ConfigService) => {
      //   // Changez () en async ()
      //   const jwtOptions = {
      //     secret: config.get('JWT_ACCESS_SECRET'),
      //     signOptions: {
      //       expiresIn: config.get('JWT_EXPIRES'),
      //     },
      //   };
      //   return jwtOptions; // Renvoyer directement jwtOptions
      // },
    }),
  ],
  controllers: [MaintenanceRequestsController],
  providers: [
    MaintenanceRequestsService,
    FileUploadService,
    TechLocation,
    MatchingService,
  ],
})
export class MaintenanceRequestsModule {}
