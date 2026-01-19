import { Controller, Post, Body } from "@nestjs/common";
import { AddressValidateService } from "./address-validate.service";
import { AddressValidateDto } from "./dto/address-validate.dto";

@Controller("address-validate")
export class AddressValidateController {
  constructor(
    private readonly addressValidateService: AddressValidateService
  ) {}

  @Post()
  validate(@Body() dto: AddressValidateDto) {
    return this.addressValidateService.validateAddress(dto.address);
  }
}
