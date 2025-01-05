import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventHandlerService } from './EventHandlerService';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { EventsGateway } from '../events.gateway';

@Injectable()
export class EndCallService implements EventHandlerService {
  SERVICE_NAME = 'EndCallService';

  constructor(
    @InjectRedis() private readonly redis: Redis,
    @Inject(forwardRef(() => EventsGateway)) // forwardRef to handle circular dependency
    private readonly eventsGateway: EventsGateway,
  ) {}

  handleMessage = async (
    action: string,
    clientId: string,
    roomId: string,
  ): Promise<void> => {
    switch (action) {
      case 'signal-end-call':
        await this.handleSignalEndCall(clientId, roomId);
        break;
      default:
        throw new Error('Unknown action');
    }
  };

  onClientConnect = async (clientId: string, roomId: string): Promise<void> => {
    console.log(`EndCallService: Client ${clientId} connected`);

    await this.redis.set(
      `${this.getRoomKey(roomId)}:${this.getUserKey(clientId)}`,
      'false',
      'EX',
      60 * 60 * 24,
    );
  };

  onClientDisconnect = async (
    clientId: string,
    roomId: string,
  ): Promise<void> => {
    console.log(`EndCallService: Client ${clientId} disconnected`);

    await this.redis.del(
      `${this.getRoomKey(roomId)}:${this.getUserKey(clientId)}`,
    );
  };

  private handleSignalEndCall = async (clientId: string, roomId: string) => {
    console.log('Handling signal-end-call event');

    await this.redis.set(
      `${this.getRoomKey(roomId)}:${this.getUserKey(clientId)}`,
      'true',
    );

    const keys = await this.redis.keys(`room:${roomId}:*`);
    const values = await this.redis.mget(keys);

    const isEveryoneEndedCall = values.every((value) => value === 'true');

    if (isEveryoneEndedCall) {
      console.log(`Ending call for room: ${roomId}`);
      await this.redis.del(...keys);
      this.eventsGateway.server?.emit('end-call');
    }
  };

  private getRoomKey(roomId: string) {
    return `room:${roomId}`;
  }

  private getUserKey(userId: string) {
    return `user:${userId}`;
  }
}
