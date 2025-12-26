import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumberString } from 'class-validator';

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
}
