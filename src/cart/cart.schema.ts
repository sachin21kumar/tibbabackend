import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cart {
  @Prop([
    {
      productId: { type: Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    },
  ])
  items: {
    productId: Types.ObjectId;
    quantity: number;
  }[];

  @Prop({ required: true, type: Types.ObjectId, ref: 'Locations' })
  locationId: Types.ObjectId;

  @Prop({ default: '' })
  specialInstructions: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
