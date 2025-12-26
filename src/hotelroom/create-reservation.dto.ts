import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  occasion?: string;

  @IsString()
  @IsOptional()
  request?: string;

  @IsBoolean()
  offers: boolean;

  @IsBoolean()
  opentableEmails: boolean;

  @IsBoolean()
  smsUpdates: boolean;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  guests: number;
}
