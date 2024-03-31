import { Global, Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { TechLocation } from './location.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/schemas/user.schema';
@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [MatchingService, TechLocation],
  exports: [MatchingService],
})
export class MatchingModule {}
