import {
  BadRequestException,
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

  // Every cart request must identify the guest's browser so carts don't
  // leak between visitors. The frontend generates this id once and sends
  // it on every request via the x-guest-id header.
  private requireGuestId(guestId?: string) {
    if (!guestId) {
      throw new BadRequestException('x-guest-id header is required.');
    }
    return guestId;
  }

  @Get()
  getCart(
    @Query('locationId') locationId: string,
    @Headers('x-guest-id') guestId: string,
    @Query('locale') queryLocale?: string,
    @Headers('x-locale') headerLocale?: string,
  ) {
    const locale = queryLocale || headerLocale || 'en';
    return this.cartService.getCart(
      locationId,
      this.requireGuestId(guestId),
      locale,
    );
  }

  @Post('add')
  addToCart(
    @Body() addToCartDto: AddToCartDto,
    @Headers('x-guest-id') guestId: string,
  ) {
    return this.cartService.addToCart(
      addToCartDto.productId,
      addToCartDto.quantity || 1,
      addToCartDto.locationId,
      this.requireGuestId(guestId),
    );
  }

  @Post('update')
  updateCart(
    @Body('locationId') locationId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
    @Body('specialInstructions') specialInstructions: string,
    @Body('cutlery') cutlery: boolean,
    @Headers('x-guest-id') guestId: string,
  ) {
    return this.cartService.updateCart(
      locationId,
      this.requireGuestId(guestId),
      productId,
      quantity,
      specialInstructions,
      cutlery,
    );
  }

  @Delete('remove')
  removeFromCart(
    @Body('productId') productId: string,
    @Body('locationId') locationId: string,
    @Headers('x-guest-id') guestId: string,
  ) {
    return this.cartService.removeFromCart(
      productId,
      locationId,
      this.requireGuestId(guestId),
    );
  }

  @Delete('clear')
  clearCart(
    @Body('locationId') locationId: string,
    @Headers('x-guest-id') guestId: string,
  ) {
    return this.cartService.clearCart(locationId, this.requireGuestId(guestId));
  }

  @Get(':productId')
  getCartItemByProductId(
    @Param('productId') productId: string,
    @Query('locationId') locationId: string,
    @Headers('x-guest-id') guestId: string,
  ) {
    return this.cartService.getCartItemByProductId(
      productId,
      locationId,
      this.requireGuestId(guestId),
    );
  }
}
