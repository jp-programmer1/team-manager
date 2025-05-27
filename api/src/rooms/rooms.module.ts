import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { EventsGateway } from '../events/events.gateway';

@Module({
  imports: [],
  controllers: [RoomsController],
  providers: [
    RoomsService,
    EventsGateway,
  ],
  exports: [RoomsService],
})
export class RoomsModule {}
