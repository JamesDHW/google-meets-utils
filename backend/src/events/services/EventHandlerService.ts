export interface EventHandlerService {
  SERVICE_NAME: string;
  onClientConnect?(clientId: string, roomId: string): void;
  onClientDisconnect?(clientId: string, roomId: string): void;
  handleMessage(action: string, data: any): void;
}
