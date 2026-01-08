import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StripeService } from '../stripe/stripe.service';
import { Order } from './checkout.schema';
import { CreateOrderDto } from './dto/checkout.dto';
import { Cart } from 'src/cart/cart.schema';
import { EmailService } from 'src/email/email.service';
import { LocationsService } from 'src/locations/locations.service'; // Import to get branch coordinates
import { UpdateOrderStatusDto } from './dto/update.status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private stripeService: StripeService,
    private emailService: EmailService,
    private locationsService: LocationsService, // Inject LocationsService
  ) {}

  // Helper: calculate distance between two coordinates using Haversine formula
  private getDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async checkout(dto: CreateOrderDto) {
    const cart = await this.cartModel.findOne().populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw new NotFoundException(
        'Your Cart is empty please add product on cart.',
      );
    }

    // ✅ Validate delivery distance if delivery type
    if (dto.deliveryType === 'delivery') {
      if (!dto.addressLatLng) {
        throw new BadRequestException(
          'Delivery address coordinates are required.',
        );
      }

      // Get selected branch location
      const location = await this.locationsService.findOne(dto.locationId);
      if (!location?.location || !location.lat || !location.lng) {
        throw new BadRequestException(
          'Branch location coordinates are not set.',
        );
      }
      const distance = this.getDistanceKm(
        dto.addressLatLng.lat,
        dto.addressLatLng.lng,
        location.lat,
        location.lng,
      );

      if (distance > 10) {
        throw new BadRequestException(
          `Delivery is not available to your address. You are ${distance.toFixed(
            2,
          )} km away from the selected branch. Maximum delivery radius is 10 km.`,
        );
      }
    }

    const items = cart.items.map((item: any) => {
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

    return {
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
    };
  }

  async confirmPayment(orderId: string) {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(orderId, {
      status: 'paid',
    });

    await this.cartModel.deleteMany({});

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }
    if (updatedOrder.email) {
      await this.emailService.sendOrderConfirmation(
        updatedOrder.email,
        updatedOrder,
      );
    }
    return updatedOrder;
  }

  async getOrdersByLocation(locationId: string) {
    return this.orderModel.find({ locationId }).sort({ createdAt: -1 });
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (dto.OrderStatus) order.OrderStatus = dto.OrderStatus;
    if (dto.driverName) order.driverName = dto.driverName;
    if (dto.driverPhone) order.driverPhone = dto.driverPhone;

    return order.save();
  }

  async getAllOrders() {
    return this.orderModel.find();
  }
}
