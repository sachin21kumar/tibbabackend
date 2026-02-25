import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {

  // English name (backend will auto-create Arabic)
  @IsString()
  @IsNotEmpty()
  name: string;

  // Important: transform string → number
  @Type(() => Number)
  @IsNumber()
  price: number;

  // Optional description (English)
  @IsString()
  @IsOptional()
  description?: string;

  // Must be a real MongoDB ObjectId
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  // optional image url (for csv/manual cases)
  @IsString()
  @IsOptional()
  imageUrl?: string;
}