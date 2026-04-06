import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('kitchen')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('KITCHEN', 'ADMIN')
export class KitchenController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders')
  getAllOrders() {
    return this.ordersService.findAll();
  }

  @Put('orders/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status, dto.note);
  }
}
