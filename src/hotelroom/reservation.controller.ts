import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateReservationDto } from './create-reservation.dto';
import { ReservationHotelService } from './reservation.service';

@Controller('reservationhotel')
export class ReservationHotelController {
  constructor(private readonly reservationService: ReservationHotelService) {}

  @Post()
  async createReservation(@Body() dto: CreateReservationDto) {
    return this.reservationService.createReservation(dto);
  }

  @Get()
  async getAllReservations() {
    return this.reservationService.getAllReservations();
  }
}
