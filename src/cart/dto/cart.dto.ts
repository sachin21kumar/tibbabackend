import { IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsMongoId()
  productId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number = 1;
}
