import { Injectable, NotFoundException } from '@nestjs/common';
import { MenuRepository } from './menu.repository';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuFilterDto } from './dto/menu-filter.dto';

@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  findAll(filters: MenuFilterDto) {
    return this.menuRepository.findAll(filters);
  }

  getCategories() {
    return this.menuRepository.getCategories();
  }

  async findOne(id: string) {
    const item = await this.menuRepository.findById(id);
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    return item;
  }

  create(dto: CreateMenuItemDto) {
    return this.menuRepository.create(dto);
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findOne(id);
    return this.menuRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.menuRepository.delete(id);
  }

  async decrementStock(menuItemId: string, quantity: number) {
    return this.menuRepository.decrementStock(menuItemId, quantity);
  }
}
