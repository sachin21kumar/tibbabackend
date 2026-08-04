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
      area?: string;
      location: string;
    }
  >;

  @Prop()
  lat?: number;

  @Prop()
  lng?: number;

  @Prop()
  operation_hours?: string;

  @Prop()
  branchEmail?: string;

  @Prop()
  telephone?: string;

  @Prop()
  mobileNumber?: string;

  @Prop()
  googleLink?: string;

  @Prop({ default: 10 })
  deliveryRadiusKm: number;

  @Prop()
  imagePath?: string;

  @Prop({ unique: true, index: true })
  slug: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
