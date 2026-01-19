import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AddressValidateController } from "./address-validate.controller";
import { AddressValidateService } from "./address-validate.service";
import { AddressValidate, AddressValidateSchema } from "./address-validate.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AddressValidate.name, schema: AddressValidateSchema }
    ])
  ],
  controllers: [AddressValidateController],
  providers: [AddressValidateService]
})
export class AddressValidateModule {}
