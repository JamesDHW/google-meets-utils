import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EndCallService } from './services/end-call.service';
import { EventHandlerService } from './services/EventHandlerService';
import { EVENT_HANDLERS_PROVIDER_NAMESPACE_TOKEN } from './events.constants';

const eventHandlers = [EndCallService];

@Module({
  providers: [
    ...eventHandlers,
    {
      provide: EVENT_HANDLERS_PROVIDER_NAMESPACE_TOKEN,
      useFactory: (...handlers: EventHandlerService[]) => handlers,
      inject: [...eventHandlers],
    },
    EventsGateway,
  ],
  exports: [EventsGateway],
})
export class EventsModule {}
