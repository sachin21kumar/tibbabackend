import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  time: string; // 7:00 PM

  @Prop({ required: true })
  guests: number;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
