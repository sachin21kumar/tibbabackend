import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  
  @Prop({ required: true })
  address: string;

  

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  orderNotes?: string;

  @Prop([
    {
      productId: { type: Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      subtotal: Number,
    },
  ])
  items: any[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  shipping: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'New', enum: ['New', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'] })
  OrderStatus: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ required: true })
  deliveryType: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Locations' })
  locationId: Types.ObjectId;

  @Prop({
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: false,
  })
  addressLatLng?: {
    lat: number;
    lng: number;
  };

  @Prop()
  driverName?: string;

  @Prop()
  driverPhone?: string;

  @Prop()
  paymentMethod?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
