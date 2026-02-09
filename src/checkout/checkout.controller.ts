import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { OrdersService } from './checkout.service';
import { CreateOrderDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update.status.dto';

@Controller('checkout')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  checkout(@Body() dto: CreateOrderDto) {
    return this.ordersService.checkout(dto);
  }

  @Post('confirm')
  async confirm(@Body('orderId') orderId: string) {
    return this.ordersService.confirmPayment(orderId);
  }

  @Get('admin/orders/:locationId')
  getOrdersByLocation(@Param('locationId') locationId: string) {
    return this.ordersService.getOrdersByLocation(locationId);
  }

  @Get('admin/orders')
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Patch('admin/:orderId')
  updateOrder(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto);
  }
}
