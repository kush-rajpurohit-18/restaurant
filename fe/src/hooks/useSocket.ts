'use client';
import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { assertPublicEnv, publicEnv } from '@/config/publicEnv';
import { SOCKET_EVENTS } from '@/constants/socketEvents';
import { Order, OrderStatus } from '@/types';

export interface OrderStatusChangedPayload {
  orderId: string;
  status: OrderStatus;
  statusHistory: Array<{ id: string; status: OrderStatus; timestamp: string; note?: string }>;
}

let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    assertPublicEnv('NEXT_PUBLIC_WS_URL', publicEnv.wsUrl);
    socketInstance = io(publicEnv.wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socketInstance;
}

export function useSocket() {
  useEffect(() => { getSocket(); }, []);

  const joinOrderRoom = useCallback((orderId: string) => {
    getSocket().emit(SOCKET_EVENTS.JOIN_ORDER_ROOM, orderId);
  }, []);

  const joinKitchen = useCallback(() => {
    getSocket().emit(SOCKET_EVENTS.JOIN_KITCHEN);
  }, []);

  const onOrderStatusChanged = useCallback((handler: (data: OrderStatusChangedPayload) => void) => {
    const socket = getSocket();
    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handler);
    return () => { socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handler); };
  }, []);

  const onNewOrder = useCallback((handler: (order: Order) => void) => {
    const socket = getSocket();
    socket.on(SOCKET_EVENTS.NEW_ORDER, handler);
    return () => { socket.off(SOCKET_EVENTS.NEW_ORDER, handler); };
  }, []);

  const onOrderUpdated = useCallback((handler: (order: Order) => void) => {
    const socket = getSocket();
    socket.on(SOCKET_EVENTS.ORDER_UPDATED, handler);
    return () => { socket.off(SOCKET_EVENTS.ORDER_UPDATED, handler); };
  }, []);

  return { joinOrderRoom, joinKitchen, onOrderStatusChanged, onNewOrder, onOrderUpdated };
}
