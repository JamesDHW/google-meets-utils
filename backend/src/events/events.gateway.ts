import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { EventHandlerService } from './services/EventHandlerService';
import { EVENT_HANDLERS_PROVIDER_NAMESPACE_TOKEN } from './events.constants';
import { CORS_CONFIG } from 'src/main';

type EventPayload = {
  service_name: string;
  action: string;
  data: any;
};

@WebSocketGateway({
  cors: CORS_CONFIG,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(EVENT_HANDLERS_PROVIDER_NAMESPACE_TOKEN)
    private readonly handlers: EventHandlerService[],
  ) {}

  @WebSocketServer() server: Server | undefined;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    this.handlers.forEach(({ onClientConnect }) => onClientConnect?.(client));
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.handlers.forEach(({ onClientDisconnect }) =>
      onClientDisconnect?.(client),
    );
  }

  @SubscribeMessage('event')
  handleEvent(
    @MessageBody()
    { service_name, action, data }: EventPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const handler = this.handlers.find(
      ({ SERVICE_NAME }) => SERVICE_NAME === service_name,
    );

    if (!handler) {
      throw new Error(`No handler found for event type: ${service_name}`);
    }

    handler.handleMessage(action, data, client);
  }
}
