import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {

  // keep image
  @Prop({ required: false })
  imageUrl: string;

  // ⭐ NEW multilingual field
  @Prop({
    type: Object,
    required: true,
    default: { en: { title: '' } }
  })
  translations: Record<string, { title: string }>;
}

export const CategorySchema = SchemaFactory.createForClass(Category);