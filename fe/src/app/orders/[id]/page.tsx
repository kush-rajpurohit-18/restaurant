'use client';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { ordersApi } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { Order, OrderStatus } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';
import styles from './tracking.module.scss';

const STATUS_STEPS = [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED];
const STEP_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]:  'Received',
  [OrderStatus.PREPARING]: 'Preparing',
  [OrderStatus.READY]:     'Ready',
  [OrderStatus.COMPLETED]: 'Done',
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { joinOrderRoom, onOrderStatusChanged } = useSocket();

  const { data: order } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id),
    refetchInterval: 30000,
  });

  useEffect(() => {
    joinOrderRoom(id);
    return onOrderStatusChanged((data) => {
      if (data.orderId === id) {
        queryClient.invalidateQueries({ queryKey: ['order', id] });
      }
    });
  }, [id, joinOrderRoom, onOrderStatusChanged, queryClient]);

  if (!order) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loading}><div className={styles.spinner} /></div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const progressPct = (currentStepIndex / (STATUS_STEPS.length - 1)) * 100;

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Order #{order.id.slice(-6).toUpperCase()}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Progress */}
        <div className={styles.panel}>
          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
            <div className={styles.steps}>
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const current = i === currentStepIndex;
                return (
                  <div key={step} className={styles.step}>
                    <div className={`${styles.stepDot} ${done ? styles.done : styles.pending}`}>
                      {done ? <CheckCircle2 /> : <Circle />}
                    </div>
                    <span className={`${styles.stepLabel} ${current ? styles.current : done ? styles.done : styles.pending}`}>
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Order Items</h2>
          {order.items.map((item) => (
            <div key={item.id} className={styles.orderItem}>
              <div className={styles.itemLeft}>
                <span className={styles.itemName}>{item.menuItem.name}</span>
                <span className={styles.itemQty}>x{item.quantity}</span>
                {item.size && item.size !== 'MEDIUM' && <span className={styles.itemSize}>({item.size})</span>}
                {item.addOns?.length > 0 && (
                  <p className={styles.itemAddons}>+ {item.addOns.map((a) => a.addOn.name).join(', ')}</p>
                )}
                {item.specialInstructions && (
                  <p className={styles.itemNote}>&quot;{item.specialInstructions}&quot;</p>
                )}
              </div>
              <span className={styles.itemPrice}>${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className={styles.totals}>
            <div className={styles.totalRow}><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className={styles.totalRow}><span>Tax</span><span>${order.taxAmount.toFixed(2)}</span></div>
            <div className={styles.totalFinal}><span>Total</span><span>${order.totalAmount.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Status Timeline</h2>
          <div className={styles.timeline}>
            {order.statusHistory.map((entry) => (
              <div key={entry.id} className={styles.timelineEntry}>
                <div className={styles.timelineDot} />
                <div>
                  <span className={styles.timelineStatus}>{entry.status}</span>
                  <span className={styles.timelineTime}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  {entry.note && <p className={styles.timelineNote}>{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
