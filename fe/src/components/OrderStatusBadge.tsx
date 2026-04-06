import { OrderStatus } from '@/types';
import styles from './OrderStatusBadge.module.scss';

const STATUS_CONFIG: Record<OrderStatus, { label: string; badgeClass: string }> = {
  [OrderStatus.RECEIVED]:  { label: 'Order Received',   badgeClass: styles.received },
  [OrderStatus.PREPARING]: { label: 'Preparing',        badgeClass: styles.preparing },
  [OrderStatus.READY]:     { label: 'Ready for Pickup', badgeClass: styles.ready },
  [OrderStatus.COMPLETED]: { label: 'Completed',        badgeClass: styles.completed },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, badgeClass } = STATUS_CONFIG[status] ?? STATUS_CONFIG[OrderStatus.RECEIVED];
  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}
