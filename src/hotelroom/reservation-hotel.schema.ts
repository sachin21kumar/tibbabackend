import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationHotelDocument = ReservationHotel & Document;

@Schema({ timestamps: true })
export class ReservationHotel {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  occasion?: string;

  @Prop()
  request?: string;

  @Prop({ default: false })
  offers: boolean;

  @Prop({ default: false })
  opentableEmails: boolean;

  @Prop({ default: false })
  smsUpdates: boolean;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  guests: number;
}

export const ReservationHotelSchema = SchemaFactory.createForClass(ReservationHotel);
