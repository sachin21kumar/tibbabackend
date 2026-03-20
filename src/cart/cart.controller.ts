import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Headers,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(
    @Query('locationId') locationId: string,
    @Query('locale') queryLocale?: string,
    @Headers('x-locale') headerLocale?: string,
  ) {
    const locale = queryLocale || headerLocale || 'en';
    return this.cartService.getCart(locationId, locale);
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
    @Body('specialInstructions') specialInstructions: string,
    @Body('cutlery') cutlery: boolean,
  ) {
    return this.cartService.updateCart(
      productId,
      quantity,
      specialInstructions,
      cutlery,
    );
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
