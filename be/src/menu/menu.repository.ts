import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MenuFilterDto } from './dto/menu-filter.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
@Injectable()
export class MenuRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: MenuFilterDto) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters.categorySlug) {
      where.category = { slug: filters.categorySlug };
    }
    if (filters.minPrice !== undefined) {
      where.price = { ...((where.price as any) || {}), gte: Number(filters.minPrice) };
    }
    if (filters.maxPrice !== undefined) {
      where.price = { ...((where.price as any) || {}), lte: Number(filters.maxPrice) };
    }
    if (filters.isVegetarian === 'true') where.isVegetarian = true;
    if (filters.isVegan === 'true') where.isVegan = true;
    if (filters.isGlutenFree === 'true') where.isGlutenFree = true;
    if (filters.isAvailable === 'true') where.isAvailable = true;

    return this.prisma.menuItem.findMany({
      where,
      include: { category: true, addOns: true },
      orderBy: { category: { sortOrder: 'asc' } },
    });
  }

  getCategories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  findById(id: string) {
    return this.prisma.menuItem.findUnique({
      where: { id },
      include: { category: true, addOns: true },
    });
  }

  create(dto: CreateMenuItemDto) {
    const { addOns, ...rest } = dto;
    return this.prisma.menuItem.create({
      data: {
        ...rest,
        addOns: addOns ? { create: addOns } : undefined,
      },
      include: { category: true, addOns: true },
    });
  }

  update(id: string, dto: UpdateMenuItemDto) {
    const { addOns, ...rest } = dto;
    return this.prisma.menuItem.update({
      where: { id },
      data: rest,
      include: { category: true, addOns: true },
    });
  }

  delete(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }

  async decrementStock(menuItemId: string, quantity: number) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.menuItem.findUnique({ where: { id: menuItemId } });
      if (!item || item.stock === null) return item;
      if (item.stock < quantity) throw new Error(`Insufficient stock for item ${menuItemId}`);
      return tx.menuItem.update({
        where: { id: menuItemId },
        data: { stock: item.stock - quantity },
      });
    });
  }
}
