import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  area: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop()
  operation_hours?: string;

  @Prop()
  branchEmail?: string;

  @Prop()
  telephone?: string;

  @Prop()
  mobileNumber?: string;

  @Prop({ default: 10 })
  deliveryRadiusKm: number;

  @Prop({ required: true })
  imagePath: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
