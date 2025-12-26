import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart() {
    return this.cartService.getCart();
  }

  @Post('add')
  addToCart(
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.addToCart(productId, quantity);
  }

  @Post('update')
  updateCart(
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateCart(productId, quantity);
  }

  @Delete('remove')
  removeFromCart(@Body('productId') productId: string) {
    return this.cartService.removeFromCart(productId);
  }

  @Delete('clear')
  clearCart() {
    return this.cartService.clearCart();
  }

  @Get(':productId')
  getCartItemByProductId(@Param('productId') productId: string) {
    return this.cartService.getCartItemByProductId(productId);
  }
}
