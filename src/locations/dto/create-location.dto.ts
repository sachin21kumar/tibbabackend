import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateLocationDto {
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
  location: string; // ✅ single string now

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
}
