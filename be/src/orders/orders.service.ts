import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { MenuService } from '../menu/menu.service';
import { OrdersGateway } from '../gateway/orders.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ConfigService } from '@nestjs/config';

interface AddOn { id: string; price: number; name: string }
interface ResolvedItem {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  specialInstructions?: string;
  addOnIds?: string[];
  menuItem: { addOns: AddOn[] };
}

const SIZE_MULTIPLIERS: Record<string, number> = { SMALL: 0.8, MEDIUM: 1.0, LARGE: 1.3 };

@Injectable()
export class OrdersService {
  private readonly taxRate: number;

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly menuService: MenuService,
    private readonly ordersGateway: OrdersGateway,
    private readonly configService: ConfigService,
  ) {
    this.taxRate = parseFloat(this.configService.get('TAX_RATE', '0.1'));
  }

  async create(dto: CreateOrderDto, customerId: string) {
    const menuItems = await Promise.all(
      dto.items.map((item) => this.menuService.findOne(item.menuItemId)),
    );

    let subtotal = 0;
    const resolvedItems: ResolvedItem[] = [];

    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      const menuItem = menuItems[i];

      if (!menuItem.isAvailable) {
        throw new BadRequestException(`${menuItem.name} is not available`);
      }

      if (menuItem.stock !== null) {
        await this.menuService.decrementStock(item.menuItemId, item.quantity);
      }

      const multiplier = SIZE_MULTIPLIERS[item.size ?? 'MEDIUM'] ?? 1.0;
      const addOnTotal = item.addOnIds?.reduce((sum: number, addOnId: string) => {
        const addOn = (menuItem.addOns as AddOn[]).find((a) => a.id === addOnId);
        return sum + (addOn?.price ?? 0);
      }, 0) ?? 0;
      const unitPrice = menuItem.price * multiplier + addOnTotal;

      subtotal += unitPrice * item.quantity;
      resolvedItems.push({ ...item, unitPrice, menuItem });
    }

    const taxAmount = subtotal * this.taxRate;
    const order = await this.ordersRepository.create({
      customerId,
      items: resolvedItems,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
    });

    this.ordersGateway.notifyNewOrder(order);
    return order;
  }

  async processPayment(orderId: string, dto: ProcessPaymentDto, customerId: string) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) throw new ForbiddenException();

    if (dto.mockFail) {
      const updatedOrder = await this.ordersRepository.updatePaymentStatus(orderId, 'FAILED');
      return { success: false, order: updatedOrder, message: 'Payment failed (simulated)' };
    }

    const success = Math.random() > 0.1;
    if (success) {
      const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const updatedOrder = await this.ordersRepository.updatePaymentStatus(orderId, 'PAID', paymentRef);
      return { success: true, order: updatedOrder, paymentRef };
    } else {
      const updatedOrder = await this.ordersRepository.updatePaymentStatus(orderId, 'FAILED');
      return { success: false, order: updatedOrder, message: 'Payment declined' };
    }
  }

  getByCustomer(customerId: string) {
    return this.ordersRepository.findByCustomer(customerId);
  }

  async findOne(id: string, customerId?: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (customerId && order.customerId !== customerId) throw new ForbiddenException();
    return order;
  }

  async updateStatus(orderId: string, status: string, note?: string) {
    const order = await this.ordersRepository.updateStatus(orderId, status, note);
    this.ordersGateway.notifyOrderStatusUpdate(order);
    return order;
  }

  findAll() {
    return this.ordersRepository.findAll();
  }
}
