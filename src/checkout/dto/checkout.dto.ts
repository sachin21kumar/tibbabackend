import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
  IsMongoId,
  ValidateNested,
  IsNumber,
} from 'class-validator';
class LatLng {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

   @IsString()
  @IsNotEmpty()
  buildingName: string;
 
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsNumberString()
  phone: string;

  @IsEmail()
  email: string;


  @IsString()
  deliveryType: string;

  @IsMongoId()
  locationId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LatLng)
  addressLatLng?: LatLng;
}
