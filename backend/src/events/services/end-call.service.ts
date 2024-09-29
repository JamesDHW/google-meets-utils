import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { EventHandlerService } from './EventHandlerService';

@Injectable()
export class EndCallService implements EventHandlerService {
  SERVICE_NAME = 'EndCallService';

  handleMessage(_type: string, data: any, client: Socket): void {
    console.log('Handling end-call event');
    client.broadcast.emit('end-call', data);
  }

  onClientConnect(client: Socket): void {
    console.log(`EndCallService: Client ${client.id} connected`);
  }

  onClientDisconnect(client: Socket): void {
    console.log(`EndCallService: Client ${client.id} disconnected`);
  }
}
