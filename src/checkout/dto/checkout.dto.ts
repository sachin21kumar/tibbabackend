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
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  pinCode: string;

  @IsNumberString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  orderNotes?: string;

  @IsString()
  deliveryType: string;

  @IsMongoId()
  locationId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LatLng)
  addressLatLng?: LatLng;
}
