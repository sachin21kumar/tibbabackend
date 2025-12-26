import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from './category/category.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './checkout/checkout.module';
import { ConfigModule } from '@nestjs/config';
import { ReservationModule } from './reservation/reservation.module';
import { ReservationHotelModule } from './hotelroom/reservation.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // 👈 IMPORTANT on Windows
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/restaurant_db'),
    CategoryModule,
    ProductsModule,
    OrdersModule,
    ReservationModule,
    ReservationHotelModule,
    LocationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
