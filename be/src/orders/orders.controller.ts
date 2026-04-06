import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(dto, req.user.id);
  }

  @Post(':id/payment')
  processPayment(@Param('id') id: string, @Body() dto: ProcessPaymentDto, @Request() req: any) {
    return this.ordersService.processPayment(id, dto, req.user.id);
  }

  @Get('my-orders')
  getMyOrders(@Request() req: any) {
    return this.ordersService.getByCustomer(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.findOne(id, req.user.id);
  }
}
