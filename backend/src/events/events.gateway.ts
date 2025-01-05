import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { EventHandlerService } from './services/EventHandlerService';
import { EVENT_HANDLERS_PROVIDER_NAMESPACE_TOKEN } from './events.constants';

type EventPayload = {
  service_name: string;
  action: string;
  data: any;
};

export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(EVENT_HANDLERS_PROVIDER_NAMESPACE_TOKEN)
    private readonly handlers: EventHandlerService[],
  ) {}

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

  // New method to handle incoming events from API Gateway
  handleEvent(eventPayload: EventPayload): void {
    const { service_name, action, data } = eventPayload;
    const handler = this.handlers.find(
      ({ SERVICE_NAME }) => SERVICE_NAME === service_name,
    );

    if (!handler) {
      throw new Error(`No handler found for event type: ${service_name}`);
    }

    handler.handleMessage(action, data, null); // Pass null for client if not needed
  }
}
