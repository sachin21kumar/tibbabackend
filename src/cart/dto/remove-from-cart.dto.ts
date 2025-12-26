import { IsMongoId } from 'class-validator';

export class RemoveFromCartDto {
  @IsMongoId()
  productId: string;
}
