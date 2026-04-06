import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DataStore, MenuItem } from '../store/data.store';
import { MenuFilterDto } from './dto/menu-filter.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuRepository {
  constructor(private readonly store: DataStore) {}

  private withCategory(item: MenuItem) {
    return { ...item, category: this.store.categories.find(c => c.id === item.categoryId)! };
  }

  findAll(filters: MenuFilterDto) {
    let items = this.store.menuItems.map(i => this.withCategory(i));

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
      );
    }
    if (filters.categorySlug) {
      items = items.filter(i => i.category?.slug === filters.categorySlug);
    }
    if (filters.minPrice !== undefined) {
      items = items.filter(i => i.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      items = items.filter(i => i.price <= Number(filters.maxPrice));
    }
    if (filters.isVegetarian === 'true') items = items.filter(i => i.isVegetarian);
    if (filters.isVegan === 'true') items = items.filter(i => i.isVegan);
    if (filters.isGlutenFree === 'true') items = items.filter(i => i.isGlutenFree);
    if (filters.isAvailable === 'true') items = items.filter(i => i.isAvailable);

    items.sort((a, b) => (a.category?.sortOrder ?? 0) - (b.category?.sortOrder ?? 0));
    return Promise.resolve(items);
  }

  getCategories() {
    const sorted = [...this.store.categories].sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.resolve(sorted);
  }

  findById(id: string) {
    const item = this.store.menuItems.find(i => i.id === id);
    return Promise.resolve(item ? this.withCategory(item) : null);
  }

  create(dto: CreateMenuItemDto) {
    const { addOns, ...rest } = dto;
    const id = uuidv4();
    const item: MenuItem = {
      imageUrl: '',
      preparationTime: 15,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      stock: null,
      ...rest,
      id,
      addOns: addOns?.map(a => ({ ...a, id: uuidv4(), menuItemId: id })) ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.menuItems.push(item);
    return Promise.resolve(this.withCategory(item));
  }

  update(id: string, dto: UpdateMenuItemDto) {
    const idx = this.store.menuItems.findIndex(i => i.id === id);
    if (idx === -1) return Promise.resolve(null);
    const { addOns, ...rest } = dto;
    this.store.menuItems[idx] = { ...this.store.menuItems[idx], ...rest, updatedAt: new Date() };
    return Promise.resolve(this.withCategory(this.store.menuItems[idx]));
  }

  delete(id: string) {
    const idx = this.store.menuItems.findIndex(i => i.id === id);
    if (idx === -1) return Promise.resolve(null);
    const [deleted] = this.store.menuItems.splice(idx, 1);
    return Promise.resolve(deleted);
  }

  async decrementStock(menuItemId: string, quantity: number) {
    const item = this.store.menuItems.find(i => i.id === menuItemId);
    if (!item || item.stock === null) return item ?? null;
    if (item.stock < quantity) throw new Error(`Insufficient stock for item ${menuItemId}`);
    item.stock -= quantity;
    return item;
  }
}
