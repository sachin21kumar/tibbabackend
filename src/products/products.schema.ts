import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {

  @Prop({ required: true })
  price: number;

  @Prop()
  imagePath?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  // ⭐ NEW MULTILINGUAL FIELD
  @Prop({
    type: Object,
    required: true,
    default: {
      en: { name: '', description: '' },
    },
  })
  translations: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
}

export const ProductSchema = SchemaFactory.createForClass(Product);