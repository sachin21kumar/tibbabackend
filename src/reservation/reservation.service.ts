import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
  ) {}

  async create(dto: CreateReservationDto) {
    const reservation = await this.reservationModel.create(dto);

    return {
      message: 'Reservation created successfully',
      data: reservation,
    };
  }

  async findAll() {
    return this.reservationModel.find().sort({ createdAt: -1 });
  }
}
