import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AddressValidateDocument = HydratedDocument<AddressValidate>;

@Schema({ timestamps: true })
export class AddressValidate {
  @Prop({ required: true })
  address: string;

  @Prop()
  matchedCountry?: string;

  @Prop()
  matchedState?: string;

  @Prop({ default: false })
  isValid: boolean;
}

export const AddressValidateSchema =
  SchemaFactory.createForClass(AddressValidate);
