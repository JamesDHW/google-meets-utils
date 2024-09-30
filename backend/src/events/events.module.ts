import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EndCallService } from './services/end-call.service';
import { EventHandlerService } from './services/EventHandlerService';
import { EVENT_HANDLERS_PROVIDER_NAMESPACE_TOKEN } from './events.constants';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

const eventHandlers = [EndCallService];

@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get<string>('REDIS_URL') ?? 'REDIS_URL NOT FOUND',
        options: {
          port: parseInt(config.get<string>('REDIS_PORT') ?? '6379'),
        },
        type: 'single',
      }),
    }),
  ],
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
