import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { MenuService } from '../menu/menu.service';
import { OrdersGateway } from '../gateway/orders.gateway';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

const mockOrdersRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByCustomer: jest.fn(),
  findAll: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentStatus: jest.fn(),
};

const mockMenuService = {
  findOne: jest.fn(),
  decrementStock: jest.fn(),
};

const mockGateway = {
  notifyNewOrder: jest.fn(),
  notifyOrderStatusUpdate: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('0.1'),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockOrdersRepository },
        { provide: MenuService, useValue: mockMenuService },
        { provide: OrdersGateway, useValue: mockGateway },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should reject order with unavailable item', async () => {
    mockMenuService.findOne.mockResolvedValue({ id: '1', name: 'Burger', isAvailable: false, price: 10, stock: null, addOns: [] });
    await expect(
      service.create({ items: [{ menuItemId: '1', quantity: 1 }] }, 'user1')
    ).rejects.toThrow(BadRequestException);
  });

  it('should create order successfully', async () => {
    const menuItem = { id: '1', name: 'Burger', isAvailable: true, price: 10, stock: null, addOns: [] };
    mockMenuService.findOne.mockResolvedValue(menuItem);
    const order = { id: 'order1', totalAmount: 11 };
    mockOrdersRepository.create.mockResolvedValue(order);
    const result = await service.create({ items: [{ menuItemId: '1', quantity: 1 }] }, 'user1');
    expect(result).toEqual(order);
    expect(mockGateway.notifyNewOrder).toHaveBeenCalledWith(order);
  });

  it('should update order status and notify gateway', async () => {
    const updated = { id: 'order1', status: 'PREPARING' };
    mockOrdersRepository.updateStatus.mockResolvedValue(updated);
    const result = await service.updateStatus('order1', 'PREPARING');
    expect(result).toEqual(updated);
    expect(mockGateway.notifyOrderStatusUpdate).toHaveBeenCalledWith(updated);
  });
});
