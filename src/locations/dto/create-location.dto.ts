import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateLocationDto {

  // English name (backend will auto-create Arabic)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  operation_hours?: string;

  @IsOptional()
  @IsEmail()
  branchEmail?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  // ⭐ VERY IMPORTANT (fixes multipart/form-data)
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @Type(() => Number)
  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  imagePath?: string;
}