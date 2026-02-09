import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './checkout.schema';
import { StripeModule } from 'src/stripe/stripe.module';
import { OrdersController } from './checkout.controller';
import { OrdersService } from './checkout.service';
import { CartModule } from 'src/cart/cart.module';
import { EmailModule } from 'src/email/email.module';
import { LocationsModule } from 'src/locations/locations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
    StripeModule,
    CartModule,
    EmailModule,
    LocationsModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

