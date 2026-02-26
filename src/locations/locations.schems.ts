import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location {
  @Prop({
    type: Object,
    required: true,
    default: {
      en: { name: '', description: '', area: '', location: '' },
    },
  })
  translations: Record<
    string,
    {
      name: string;
      description?: string;
      area: string;
      location: string;
    }
  >;

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

  @Prop({ unique: true, index: true })
  slug: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
