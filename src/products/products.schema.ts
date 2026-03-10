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

  @Prop({ type: Types.ObjectId, ref: 'SubCategory' })
  subCategoryId?: Types.ObjectId;

  @Prop({
    type: Object,
    required: true,
    default: {
      en: { name: '', description: '' },
      ar: { name: '', description: '' },
    },
  })
  translations: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;

  @Prop()
  foodType?: string;

  @Prop({ default: 'food' })
  taxProductGroup?: string;

  @Prop()
  kitchenDept?: string;

  @Prop({ default: 0 })
  stock?: number;

  @Prop({ default: 0 })
  preparationTime?: number;

  @Prop({ default: 1 })
  isActive?: number;

  @Prop({ default: 0 })
  itemType?: number;

  @Prop({ default: 1 })
  platformStatus?: number;

  @Prop({ default: 0 })
  syncToAggregator?: number;

  @Prop()
  salePrice1?: number;

  @Prop()
  salePrice2?: number;

  @Prop()
  salePrice3?: number;

  @Prop()
  salePrice4?: number;

  @Prop()
  salePrice5?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);