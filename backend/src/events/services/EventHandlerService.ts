import { Socket } from 'socket.io';

export interface EventHandlerService {
  SERVICE_NAME: string;
  onClientConnect?(client: Socket): void;
  onClientDisconnect?(client: Socket): void;
  handleMessage(action: string, data: any, client: Socket): void;
}
