import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart() {
    return this.cartService.getCart();
  }

  @Post('add')
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(
      addToCartDto.productId,
      addToCartDto.quantity || 1,
      addToCartDto.locationId,
    );
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
