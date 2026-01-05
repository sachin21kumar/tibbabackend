import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['New', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'])
  OrderStatus: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;
}
