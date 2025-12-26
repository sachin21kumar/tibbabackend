import { Body, Controller, Post, Req } from '@nestjs/common';
import { OrdersService } from './checkout.service';
import { CreateOrderDto } from './dto/checkout.dto';

@Controller('checkout')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // STEP 1: Create Payment Intent
   @Post()
  checkout(@Body() dto: CreateOrderDto) {
    return this.ordersService.checkout(dto);
  }

  // STEP 2: Confirm order after payment success
  @Post('confirm')
  async confirm(@Body('orderId') orderId: string) {
    return this.ordersService.confirmPayment(orderId);
  }
}
