import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  salePrice1?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  salePrice2?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  salePrice3?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  salePrice4?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  salePrice5?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsMongoId()
  @IsOptional()
  subCategoryId?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  foodType?: string;

  @IsString()
  @IsOptional()
  taxProductGroup?: string;

  @IsString()
  @IsOptional()
  kitchenDept?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  stock?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  preparationTime?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  isActive?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  itemType?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  platformStatus?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  syncToAggregator?: number;
}