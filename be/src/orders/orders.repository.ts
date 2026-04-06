import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ORDER_INCLUDE = {
  customer: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      menuItem: { include: { category: true } },
      addOns: { include: { addOn: true } },
    },
  },
  statusHistory: { orderBy: { timestamp: 'asc' as const } },
};

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    customerId: string;
    items: any[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  }) {
    return this.prisma.order.create({
      data: {
        customerId: data.customerId,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        statusHistory: { create: { status: 'RECEIVED' } },
        items: {
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            size: item.size,
            specialInstructions: item.specialInstructions,
            addOns: item.addOnIds?.length
              ? {
                  create: item.addOnIds.map((addOnId: string) => {
                    const addOn = item.menuItem.addOns.find((a: any) => a.id === addOnId);
                    return { addOnId, price: addOn?.price ?? 0 };
                  }),
                }
              : undefined,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  findById(id: string) {
    return this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  }

  findByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.statusHistory.create({ data: { orderId: id, status, note } });
      return tx.order.update({
        where: { id },
        data: { status },
        include: ORDER_INCLUDE,
      });
    });
  }

  updatePaymentStatus(id: string, paymentStatus: 'PAID' | 'FAILED' | 'PENDING', paymentRef?: string) {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus, paymentRef },
      include: ORDER_INCLUDE,
    });
  }
}
