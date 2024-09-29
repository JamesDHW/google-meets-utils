# Websockets example with nest

1. Create a new gateway called events `npx nest g ga events`
2. Create a new module for that gateway `npx nest g module events`
3. Install: `pnpm i socket.io`
4. Add a handler to the `src/events/events.gateway.ts` file
   a. add a `@WebSocketServer() server: Server;` to the class to access info about the socket server
   b. add a `handleConnection(client: any, ...args: any[])` to hook into the client connection event.
   c. add a `handleDisconnect(client: any)` to hook into the client disconnected event.
   d. add an event listener message `@SubscribeMessage('event') handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket)` - when the client connected by a web socket emits an "event" event this handler will hook in and get called.
   e. send a response to all other clients connected to the websocket (excluding the one that sent the initial message): `client.broadcast.emit('event');` so they can react in realtime.
5. Install: `pnpm i socket.io-client ts-node`
6. Create a client example with ts-node, one client to subscribe, another to publish an event - we should see that when the publishing process sends a signal to the server, the subscribing client knows what happened on the server (no need for polling!) - see `./client/`.
7. Send through a payload from one client to the other!
