import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { MenuRepository } from './menu.repository';
import { NotFoundException } from '@nestjs/common';

const mockMenuRepository = {
  findAll: jest.fn(),
  getCategories: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  decrementStock: jest.fn(),
};

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: MenuRepository, useValue: mockMenuRepository },
      ],
    }).compile();
    service = module.get<MenuService>(MenuService);
    jest.clearAllMocks();
  });

  it('should return all menu items with filters', async () => {
    const items = [{ id: '1', name: 'Burger', price: 10 }];
    mockMenuRepository.findAll.mockResolvedValue(items);
    const result = await service.findAll({});
    expect(result).toEqual(items);
    expect(mockMenuRepository.findAll).toHaveBeenCalledWith({});
  });

  it('should throw NotFoundException when item not found', async () => {
    mockMenuRepository.findById.mockResolvedValue(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should return item when found', async () => {
    const item = { id: '1', name: 'Burger' };
    mockMenuRepository.findById.mockResolvedValue(item);
    const result = await service.findOne('1');
    expect(result).toEqual(item);
  });

  it('should create a menu item', async () => {
    const dto = { name: 'Pizza', price: 15, categoryId: 'cat1', description: 'desc' };
    const created = { id: '2', ...dto };
    mockMenuRepository.create.mockResolvedValue(created);
    const result = await service.create(dto as any);
    expect(result).toEqual(created);
  });
});
