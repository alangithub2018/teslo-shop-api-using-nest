import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({
  cors: true
})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    // console.log(payload);

    // console.log('Client connected', client.id);

    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients());

    // console.log('Connected clients:', this.messageWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected', client.id);
    this.messageWsService.removeClient(client.id);
    // console.log('Connected clients:', this.messageWsService.getConnectedClients());

    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto): void {
    
    // Emitir unicamente al cliente que envió el mensaje
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'No hay mensaje'
    // });

    // Emitir a todos los clientes conectados menos al que envió el mensaje
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Otro usuario',
    //   message: payload.message || 'No hay mensaje'
    // });

    // Emitir a todos los clientes conectados
    this.wss.emit('message-from-server', {
      fullName: this.messageWsService.getUserFullName(client.id),
      message: payload.message || 'No hay mensaje'
    });
  }

}
