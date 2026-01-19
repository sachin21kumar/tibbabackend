import { IsString, MinLength } from "class-validator";

export class AddressValidateDto {
  @IsString()
  @MinLength(3, { message: "Address is too short" })
  address: string;
}
