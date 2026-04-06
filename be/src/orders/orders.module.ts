import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { MenuModule } from '../menu/menu.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [MenuModule, GatewayModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
