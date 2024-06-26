import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [ConfigModule],
  exports: [EventsGateway],
  providers: [EventsGateway],
})
export class EventsModule {}
