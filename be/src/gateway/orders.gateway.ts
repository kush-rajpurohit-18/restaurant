import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-order-room')
  handleJoinOrderRoom(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
  }

  @SubscribeMessage('join-kitchen')
  handleJoinKitchen(client: Socket) {
    client.join('kitchen');
  }

  notifyNewOrder(order: any) {
    this.server.to('kitchen').emit('new-order', order);
  }

  notifyOrderStatusUpdate(order: any) {
    this.server.to('kitchen').emit('order-updated', order);
    this.server.to(`order:${order.id}`).emit('order-status-changed', {
      orderId: order.id,
      status: order.status,
      statusHistory: order.statusHistory,
    });
  }
}
