import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: false })
  imageUrl: string;

  @Prop({
    type: Object,
    required: true,
    default: { en: { title: '' } },
  })
  translations: Record<string, { title: string }>;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
