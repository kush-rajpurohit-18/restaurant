import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DataStore, Order, StatusHistory } from '../store/data.store';

@Injectable()
export class OrdersRepository {
  constructor(private readonly store: DataStore) {}

  private sorted(order: Order): Order {
    return {
      ...order,
      statusHistory: [...order.statusHistory].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
      ),
    };
  }

  async create(data: {
    customerId: string;
    items: any[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  }) {
    const orderId = uuidv4();
    const now = new Date();

    const customer = this.store.users.find(u => u.id === data.customerId);

    const statusEntry: StatusHistory = {
      id: uuidv4(),
      orderId,
      status: 'RECEIVED',
      timestamp: now,
    };

    const orderItems = data.items.map(item => {
      const orderItemId = uuidv4();
      const addOns = (item.addOnIds ?? []).map((addOnId: string) => {
        const addOn = item.menuItem.addOns.find((a: any) => a.id === addOnId);
        return { id: uuidv4(), orderItemId, addOnId, addOn, price: addOn?.price ?? 0 };
      });
      return {
        id: orderItemId,
        orderId,
        menuItemId: item.menuItemId,
        menuItem: {
          ...item.menuItem,
          category: this.store.categories.find(c => c.id === item.menuItem.categoryId)!,
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        size: item.size,
        specialInstructions: item.specialInstructions,
        addOns,
      };
    });

    const order: Order = {
      id: orderId,
      customerId: data.customerId,
      customer: customer
        ? { id: customer.id, name: customer.name, email: customer.email }
        : { id: data.customerId, name: 'Guest', email: '' },
      items: orderItems,
      status: 'RECEIVED',
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      paymentStatus: 'PENDING',
      statusHistory: [statusEntry],
      createdAt: now,
      updatedAt: now,
    };

    this.store.orders.push(order);
    return this.sorted(order);
  }

  findById(id: string) {
    const order = this.store.orders.find(o => o.id === id);
    return Promise.resolve(order ? this.sorted(order) : null);
  }

  findByCustomer(customerId: string) {
    const orders = this.store.orders
      .filter(o => o.customerId === customerId)
      .map(o => this.sorted(o))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return Promise.resolve(orders);
  }

  findAll() {
    const orders = this.store.orders
      .map(o => this.sorted(o))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return Promise.resolve(orders);
  }

  async updateStatus(id: string, status: string, note?: string) {
    const order = this.store.orders.find(o => o.id === id);
    if (!order) throw new Error(`Order ${id} not found`);
    order.statusHistory.push({ id: uuidv4(), orderId: id, status, timestamp: new Date(), note });
    order.status = status;
    order.updatedAt = new Date();
    return this.sorted(order);
  }

  updatePaymentStatus(id: string, paymentStatus: 'PAID' | 'FAILED' | 'PENDING', paymentRef?: string) {
    const order = this.store.orders.find(o => o.id === id);
    if (!order) return Promise.resolve(null);
    order.paymentStatus = paymentStatus;
    if (paymentRef) order.paymentRef = paymentRef;
    order.updatedAt = new Date();
    return Promise.resolve(this.sorted(order));
  }
}
