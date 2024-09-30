import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
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
    _data: any,
    client: Socket,
  ): Promise<void> => {
    switch (action) {
      case 'signal-end-call':
        this.handleSignalEndCall(client);
        break;
      default:
        throw new Error('Unknown action');
    }
  };

  onClientConnect = async (client: Socket): Promise<void> => {
    console.log(`EndCallService: Client ${client.id} connected`);
    const roomId = this.getRoomIdOrThrow(client);

    await this.redis.set(
      `${this.getRoomKey(roomId)}:${this.getUserKey(client.id)}`,
      'false',
      'EX',
      60 * 60 * 24,
    );
  };

  onClientDisconnect = async (client: Socket): Promise<void> => {
    console.log(`EndCallService: Client ${client.id} disconnected`);
    const roomId = this.getRoomIdOrThrow(client);

    await this.redis.del(
      `${this.getRoomKey(roomId)}:${this.getUserKey(client.id)}`,
    );
  };

  private handleSignalEndCall = async (client: Socket) => {
    console.log('Handling signal-end-call event');

    const roomId = this.getRoomIdOrThrow(client);

    await this.redis.set(
      `${this.getRoomKey(roomId)}:${this.getUserKey(client.id)}`,
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

  private getRoomIdOrThrow(client: Socket): string {
    const roomId = client.handshake.query.room_id;

    if (typeof roomId !== 'string') {
      throw new Error('Room ID is required');
    }
    return roomId;
  }

  private getRoomKey(roomId: string) {
    return `room:${roomId}`;
  }

  private getUserKey(userId: string) {
    return `user:${userId}`;
  }
}
