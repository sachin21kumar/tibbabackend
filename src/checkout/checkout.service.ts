import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StripeService } from '../stripe/stripe.service';
import { Order } from './checkout.schema';
import { CreateOrderDto } from './dto/checkout.dto';
import { Cart } from 'src/cart/cart.schema';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private stripeService: StripeService,
    private emailService: EmailService
  ) {}

  async checkout(dto: CreateOrderDto) {
    const cart = await this.cartModel.findOne().populate('items.productId');
    console.log(cart?.items, 'cart+++++');
    if (!cart || cart.items.length === 0) {
      throw new NotFoundException(
        'Your Cart is empty please add product on cart.',
      );
    }

    const items = cart.items.map((item: any) => {
      console.log(item); // log each item
      return {
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        subtotal: item.productId.price * item.quantity,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const shipping = 0;
    const total = subtotal + shipping;
    console.log(total, 'total++++');

    const order = new this.orderModel({
      ...dto,
      items,
      subtotal,
      shipping,
      total,
      status: 'pending',
    });

    await order.save();
    const paymentIntent = await this.stripeService.createPaymentIntent(
      total,
      order._id.toString(),
    );

    // Optional: clear cart
    // await this.cartModel.deleteMany({});

    return {
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    };
  }

  async confirmPayment(orderId: string) {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      { status: 'paid' },
      { new: true },
    );

    await this.cartModel.deleteMany({});

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }
if (updatedOrder.email) {
      await this.emailService.sendOrderConfirmation(updatedOrder.email, updatedOrder);
    }
    return updatedOrder;
  }
}
