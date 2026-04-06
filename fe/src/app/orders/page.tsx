'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { ordersApi } from '@/services/api';
import { Order } from '@/types';
import { ArrowRight } from 'lucide-react';
import styles from './orders.module.scss';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: ordersApi.getMyOrders,
  });

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>My Orders</h1>
        {isLoading ? (
          <div className={styles.skeletons}>
            {[1, 2, 3].map((i) => <div key={i} className={`${styles.skeletonItem} ${styles.skeleton}`} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <p>No orders yet</p>
            <Link href="/menu">Order now</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className={styles.orderCard}>
                <div className={styles.cardInner}>
                  <div>
                    <p className={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                    </p>
                    <p className={styles.orderAmt}>${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className={styles.cardRight}>
                    <OrderStatusBadge status={order.status} />
                    <ArrowRight />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
