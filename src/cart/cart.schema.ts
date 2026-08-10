import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

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

  // Identifies the guest's browser (sent via the x-guest-id header) so each
  // visitor gets their own cart instead of sharing one per location.
  @Prop({ required: true })
  guestId: string;

  @Prop({ default: '' })
  specialInstructions: string;

  @Prop({ required: false, default: false })
  cutlery: boolean;

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  deliveryFee: number;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ default: 'TIBBA25' })
  couponCode: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ locationId: 1, guestId: 1 });
