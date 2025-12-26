import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationHotel, ReservationHotelSchema } from './reservation-hotel.schema';
import { ReservationHotelController } from './reservation.controller';
import { ReservationHotelService } from './reservation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReservationHotel.name, schema: ReservationHotelSchema }]),
  ],
  controllers: [ReservationHotelController],
  providers: [ReservationHotelService],
})
export class ReservationHotelModule {}
