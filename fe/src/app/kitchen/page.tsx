'use client';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenApi } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { Order, OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { ChefHat, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from './kitchen.module.scss';

const STATUS_CONFIG: Record<OrderStatus, { next: OrderStatus | null; label: string; btnClass: string }> = {
  [OrderStatus.RECEIVED]:  { next: OrderStatus.PREPARING, label: 'Start Preparing', btnClass: styles.btnPrepare },
  [OrderStatus.PREPARING]: { next: OrderStatus.READY,     label: 'Mark Ready',      btnClass: styles.btnReady },
  [OrderStatus.READY]:     { next: OrderStatus.COMPLETED, label: 'Complete',         btnClass: styles.btnComplete },
  [OrderStatus.COMPLETED]: { next: null,                  label: '',                 btnClass: '' },
};

const BORDER_CLASS: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]:  styles.borderReceived,
  [OrderStatus.PREPARING]: styles.borderPreparing,
  [OrderStatus.READY]:     styles.borderReady,
  [OrderStatus.COMPLETED]: styles.borderCompleted,
};

export default function KitchenPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { joinKitchen, onNewOrder, onOrderUpdated } = useSocket();
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!isAuthenticated() || (user?.role !== 'KITCHEN' && user?.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }
    joinKitchen();
    const unsubNew = onNewOrder((order) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success(`New order #${order.id.slice(-6).toUpperCase()}!`);
    });
    const unsubUpdated = onOrderUpdated(() => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    });
    return () => { unsubNew(); unsubUpdated(); };
  }, [isAuthenticated, user, router, joinKitchen, onNewOrder, onOrderUpdated, queryClient]);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['kitchen-orders'],
    queryFn: kitchenApi.getAllOrders,
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      kitchenApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const filteredOrders = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  const activeCount = orders.filter((o) => o.status !== OrderStatus.COMPLETED).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <ChefHat className={styles.brandIcon} />
            <div>
              <h1 className={styles.brandTitle}>Kitchen Dashboard</h1>
              <p className={styles.activeCount}>{activeCount} active orders</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{user?.name}</span>
            <button onClick={() => { logout(); router.push('/'); }} className={styles.logoutBtn}>
              <LogOut />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.filterBar}>
          {(['ALL', ...Object.values(OrderStatus)] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`${styles.filterBtn} ${filter === status ? styles.filterBtnActive : ''}`}
            >
              {status}
              {status !== 'ALL' && ` (${orders.filter((o) => o.status === status).length})`}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <p className={styles.empty}>No orders to display</p>
        ) : (
          <div className={styles.grid}>
            {filteredOrders.map((order) => {
              const { next: nextStatus, label, btnClass } = STATUS_CONFIG[order.status];
              const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
              return (
                <div key={order.id} className={`${styles.card} ${BORDER_CLASS[order.status]}`}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</p>
                      <p className={styles.orderMeta}>{order.customer.name} · {elapsed}m ago</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className={styles.itemList}>
                    {order.items.map((item) => (
                      <div key={item.id} className={styles.orderItem}>
                        <div className={styles.orderItemRow}>
                          <span className={styles.itemName}>{item.menuItem.name}</span>
                          <span className={styles.itemQty}>x{item.quantity}</span>
                        </div>
                        {item.size && item.size !== 'MEDIUM' && (
                          <span className={styles.itemSize}>({item.size})</span>
                        )}
                        {item.addOns?.length > 0 && (
                          <p className={styles.itemAddons}>+ {item.addOns.map((a) => a.addOn.name).join(', ')}</p>
                        )}
                        {item.specialInstructions && (
                          <p className={styles.itemNote}>&quot;{item.specialInstructions}&quot;</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {nextStatus && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: nextStatus })}
                      disabled={updateStatusMutation.isPending}
                      className={`${styles.actionBtn} ${btnClass}`}
                    >
                      {label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
