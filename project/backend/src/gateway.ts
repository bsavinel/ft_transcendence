import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/*
 * We can consumme or emit event on the gateway server.
 * You have a websocket server that can receive events from the client
 * that is consumming the websocket server. The chat (the ui) is the
 * client that is going to consumme the websocket server, and  the chat
 * needs to send events to the websocket gateway, using the websocket
 * protocol.
 * Our web socket gateway is a socket io server.
 */

/*
 * VIP Datas:
 * -  namespace: to set in the url, pour 'decouper' les ws.
 * -  SubscribeMessage param: to set in the client (front)
 *    'acknoledgement' opt.
 */

@WebSocketGateway({
  namespace: 'chatns',
  cors: { origin: '*' },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // Attaches the web socket server to the attribute 'server';
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  afterInit() {
    this.logger.log('Init done');
  }

  handleConnection(client: Socket) {
    this.logger.log('Connected: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Disconnected: ' + client.id);
  }

  // this means we can send events to the server under the 'newMsg'
  // event name.
  @SubscribeMessage('newMsg')
  onNewMessage(@MessageBody() msgbody: any) {
    console.log(msgbody);
    this.server.emit('afterNewMessage', {
      user: msgbody.user,
      message: msgbody.message,
    });
  }
}