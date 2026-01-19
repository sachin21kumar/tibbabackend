import { Injectable } from '@nestjs/common';
import { Country, State } from 'country-state-city';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AddressValidate,
  AddressValidateDocument,
} from './address-validate.schema';

@Injectable()
export class AddressValidateService {
  private countries = Country.getAllCountries();
  private states = State.getAllStates();

  constructor(
    @InjectModel(AddressValidate.name)
    private addressValidateModel: Model<AddressValidateDocument>,
  ) {}

  async validateAddress(address: string) {
    const text = address.toLowerCase();

    let matchedCountry: string | null = null;
    let matchedState: string | null = null;

    // 🔍 Match state first (more precise)
    for (const state of this.states) {
      if (text.includes(state.name.toLowerCase())) {
        matchedState = state.name;

        const country = this.countries.find(
          (c) => c.isoCode === state.countryCode,
        );
        matchedCountry = country?.name || null;
        break;
      }
    }

    // 🔍 Match country (if state not found)
    if (!matchedCountry) {
      for (const country of this.countries) {
        if (text.includes(country.name.toLowerCase())) {
          matchedCountry = country.name;
          break;
        }
      }
    }

    const isValid = Boolean(matchedCountry || matchedState);

    // 📝 Save log
    await this.addressValidateModel.create({
      address,
      matchedCountry,
      matchedState,
      isValid,
    } as any);

    if (!isValid) {
      return {
        valid: false,
        message: 'Address must contain a valid country or state name',
      };
    }

    return {
      valid: true,
      matchedCountry,
      matchedState,
    };
  }
}
