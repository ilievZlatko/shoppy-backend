import { AuthService } from '@/auth/auth.service';
import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ProductsGateway {
  constructor(private readonly authService: AuthService) {}

  @WebSocketServer()
  private readonly server: Server;

  public handleProductUpdated(): void {
    this.server.emit('productUpdated');
  }

  handleConnection(client: Socket) {
    try {
      this.authService.verifyToken(client.handshake.auth.Authentication);
    } catch (error) {
      console.error('Unauthorized connection:', error);
      throw new WsException('Unauthorized connection.');
    }
  }
}
