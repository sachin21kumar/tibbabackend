import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReservationDto } from './create-reservation.dto';
import { ReservationHotel, ReservationHotelDocument } from './reservation-hotel.schema';

@Injectable()
export class ReservationHotelService {
  constructor(
    @InjectModel(ReservationHotel.name)
    private reservationModel: Model<ReservationHotelDocument>,
  ) {}

  async createReservation(dto: CreateReservationDto): Promise<ReservationHotel> {
    const reservation = new this.reservationModel(dto);
    return reservation.save();
  }

  async getAllReservations(): Promise<ReservationHotel[]> {
    return this.reservationModel.find().exec();
  }
}
